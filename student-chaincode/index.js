
'use strict';

const StudentContract = require('./student/student-chaincode');

module.exports.StudentContract = StudentContract;
module.exports.contracts = [StudentContract];
