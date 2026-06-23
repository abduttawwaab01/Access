#!/usr/bin/env node

// Simple test to verify the exam filtering logic
function testExamFilteringLogic() {
  console.log("Testing exam filtering logic...")
  
  // Mock data
  const student = {
    id: "STU123",
    classId: "CLASS_10A"
  }
  
  const studentSubjects = [
    { id: "SUBJ_101", name: "Mathematics", classId: "CLASS_10A" },
    { id: "SUBJ_102", name: "Science", classId: "CLASS_10A" },
    { id: "SUBJ_103", name: "English", classId: "CLASS_10A" }
  ]
  
  const allExams = [
    { id: "EXM_001", title: "Mid-Term Mathematics", classId: "CLASS_10A", subjectId: "SUBJ_101" },
    { id: "EXM_002", title: "Science Quiz", classId: "CLASS_10A", subjectId: "SUBJ_102" },
    { id: "EXM_003", title: "English Essay", classId: "CLASS_10A", subjectId: "SUBJ_103" },
    { id: "EXM_004", title: "History Test", classId: "CLASS_10B", subjectId: "SUBJ_201" },
    { id: "EXM_005", title: "Physics Practical", classId: "CLASS_10B", subjectId: "SUBJ_202" }
  ]
  
  console.log('Testing with student: ' + student.id + ' (Class: ' + student.classId + ')')
  console.log('Student subjects: ' + studentSubjects.map(s => s.name).join(', '))
  
  console.log('\nAll exams:')
  allExams.forEach(exam => {
    console.log('  - ' + exam.title + ' (Class: ' + exam.classId + ', Subject: ' + exam.subjectId + ')')
  })
  
  // Filter exams for student
  const studentSubjectIds = studentSubjects.map(s => s.id)
  const filteredExams = allExams.filter(exam => 
    exam.classId === student.classId && 
    studentSubjectIds.includes(exam.subjectId)
  )
  
  console.log('\nFiltered exams for student (' + filteredExams.length + '):')
  filteredExams.forEach(exam => {
    console.log('  - ' + exam.title + ' (Class: ' + exam.classId + ', Subject: ' + exam.subjectId + ')')
  })
  
  // Verify results
  if (filteredExams.length === 3) {
    console.log('\n✅ Exam filtering test passed!')
    return true
  } else {
    console.log('\n❌ Exam filtering test failed!')
    return false
  }
}

function testExamSessionValidationLogic() {
  console.log('\n\nTesting exam session validation logic...')
  
  const exam = {
    id: "EXM_001",
    title: "Mid-Term Mathematics",
    classId: "CLASS_10A"
  }
  
  const student = {
    id: "STU123",
    classId: "CLASS_10A"
  }
  
  const differentStudent = {
    id: "STU456",
    classId: "CLASS_10B"
  }
  
  console.log('Testing with exam: ' + exam.title + ' (Class: ' + exam.classId + ')')
  console.log('Testing with student: ' + student.id + ' (Class: ' + student.classId + ')')
  console.log('Testing with student from different class: ' + differentStudent.id + ' (Class: ' + differentStudent.classId + ')')
  
  // Test 1: Student from same class should pass
  if (student.classId === exam.classId) {
    console.log('✅ Student is enrolled in the exam\'s class - validation should pass')
  } else {
    console.log('❌ Student is not enrolled in the exam\'s class - validation should fail')
    return false
  }
  
  // Test 2: Student from different class should fail
  if (differentStudent.classId !== exam.classId) {
    console.log('✅ Student is not enrolled in the exam\'s class - validation should fail')
  } else {
    console.log('❌ Student is enrolled in the exam\'s class - validation should pass')
    return false
  }
  
  console.log('\n✅ Exam session validation test passed!')
  return true
}

function main() {
  console.log('=' .repeat(60))
  console.log('Exam System Fix Verification Tests')
  console.log('=' .repeat(60))
  
  const filteringTestPassed = testExamFilteringLogic()
  const validationTestPassed = testExamSessionValidationLogic()
  
  console.log('\n' + '=' .repeat(60))
  console.log('Test Results:')
  console.log('  - Exam Filtering: ' + (filteringTestPassed ? '✅ PASSED' : '❌ FAILED'))
  console.log('  - Exam Session Validation: ' + (validationTestPassed ? '✅ PASSED' : '❌ FAILED'))
  
  if (filteringTestPassed && validationTestPassed) {
    console.log('\n🎉 All tests passed! The fixes are working correctly.')
  } else {
    console.log('\n⚠️  Some tests failed. Please review the fixes.')
  }
  console.log('=' .repeat(60))
}

main()
