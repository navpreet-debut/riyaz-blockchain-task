# riyaz-blockchain-task

#=================================== Before you begin =================================================#
Before you can run the test network, you need to clone the fabric-samples repository and download the Fabric images.

Important: This tutorial is compatible with the Fabric test network sample v2.2.x. After you have installed the prerequisites, you must run the following command to clone the required version of the hyperledger/fabric samples repository and checkout the correct version tag.

If you want the latest production release, omit all version identifiers and run the following commands.

curl -sSL https://bit.ly/2ysbOFE | bash -s

If you want a specific release, pass a version identifier like(2.2.5) for Fabric and Fabric-CA docker images. 

curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.2.5 1.5.2

#==================================== Start the network ===============================================#
Use the following command to navigate to the test network directory within your local clone of the fabric-samples repository:

cd fabric-samples/test-network

Run the following command to kill any active or stale docker containers and remove previously generated artifacts.

./network.sh down

docker rm -f $(docker ps -aq)

docker network prune

docker volume prune

Run the following command to start the test network: The createChannel command creates a channel named mychannel with two channel 
members, Org1 and Org2.

./network.sh up createChannel

We can now use the Peer CLI to deploy the asset-transfer (basic) chaincode to the channel using the following steps:
Step one: Package the smart contract
Step two: Install the chaincode package
Step three: Approve a chaincode definition
Step four: Committing the chaincode definition to the channel

#============================= Step-1: Package the smart contract ============================================#
Before we package the chaincode, we need to install the chaincode dependences. So put the student-chaincode folder in the fabric-samples/asset-transfer-basic and Navigate to this folder running this command.

cd fabric-samples/asset-transfer-basic/student-chaincode

To install the smart contract dependencies, run the following command from the fabric-samples/asset-transfer-basic/student-chaincode
 directory.

npm install

Navigate back to our working directory in the test-network folder so that we can package the chaincode together with our other network artifacts.

cd ../../test-network

The peer binaries are located in the bin folder of the fabric-samples repository. Use the following command to add those binaries to your CLI Path:

export PATH=${PWD}/../bin:$PATH

You also need to set the FABRIC_CFG_PATH to point to the core.yaml file in the fabric-samples repository:

export FABRIC_CFG_PATH=$PWD/../config/

You can now create the chaincode package using the peer lifecycle chaincode package command:

peer lifecycle chaincode package basic.tar.gz --path ../asset-transfer-basic/student-chaincode/ --lang node --label basic_1.0

#============================== Step-2: Install the chaincode package =========================================#
Let’s install the chaincode on the Org1 peer first. Set the following environment variables to operate the peer CLI as the 
Org1 admin user. The CORE_PEER_ADDRESS will be set to point to the Org1 peer, peer0.org1.example.com.

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

Issue the peer lifecycle chaincode install command to install the chaincode on the peer of Org1:

peer lifecycle chaincode install basic.tar.gz

You can now install the chaincode on the Org2 peer. Set the following environment variables to operate as the Org2 admin and 
target the Org2 peer, peer0.org2.example.com.

export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051

Issue the peer lifecycle chaincode install command to install the chaincode on the peer of Org2:

peer lifecycle chaincode install basic.tar.gz

#============================ Step-3: Approve a chaincode definition =================================#
You can find the package ID of a chaincode by using the peer lifecycle chaincode queryinstalled command to query your peer.

peer lifecycle chaincode queryinstalled

Now you are going to use the package ID when you approve the chaincode, so let’s export it as environment variable

export CC_PACKAGE_ID=(example:basic_1.0:3cfcf67978d6b3f7c5e0375660c995b21db19c4330946079afc3925ad7306881)

Because the environment variables have been set to operate the peer CLI as the Org2 admin, we can approve the chaincode 
definition of asset-transfer (basic) as Org2

peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name basic --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

We still need to approve the chaincode definition as Org1. Set the following environment variables to operate as the 
Org1 admin:

export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_ADDRESS=localhost:7051

You can now approve the chaincode definition as Org1.

peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name basic --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

#============================ Step-4: Committing the chaincode definition to the channel ===================================#
You can use the peer lifecycle chaincode checkcommitreadiness command to check whether channel members have approved the same 
chaincode definition.

peer lifecycle chaincode checkcommitreadiness --channelID mychannel --name basic --version 1.0 --sequence 1 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --output json

You can use the peer lifecycle chaincode commit command to commit the chaincode definition to the channel. The commit command 
also needs to be submitted by an organization admin.

peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name basic --version 1.0 --sequence 1 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt

You can use the peer lifecycle chaincode querycommitted command to confirm that the chaincode definition has been committed 
to the channel.

peer lifecycle chaincode querycommitted --channelID mychannel --name basic --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

#============================= Step-5: Invoke and Query the chaincode ==================================#
Invoke the chaincode with InitLedger function to add a base set of students to the ledger

peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"InitLedger","Args":[]}'

Query the chaincode with GetAllStudents function to returns all students records found in the world state.

peer chaincode query -C mychannel -n basic -c '{"Args":["GetAllStudents"]}'

Invoke the chaincode with AddNewStudent function to add a new student to the world state with given details.

peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"AddNewStudent","Args":["student4","riyaz","ahmad","riyaz@gmail.com","12345","kbh","pb"]}'

Invoke the chaincode with UpdateStudentInfo function to update an existing Student on the blockchain network with provided parameters.

peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"UpdateStudentInfo","Args":["student4","Riyaz","Ansari","ansari@gmail.com","12345","kbh","pb"]}'

Query the chaincode with GetSingleStudent function to get single stuent details stored in the blockchain network with given id.

peer chaincode query -C mychannel -n basic -c '{"Args":["GetSingleStudent","student2"]}'
