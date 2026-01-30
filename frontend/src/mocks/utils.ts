export const generateUUIDv7 = () => {
  const timestamp = Date.now();
  const randomBytes =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  return (timestamp.toString(16) + randomBytes)
    .padEnd(32, "0")
    .substring(0, 32);
};

export const getCurrentTime = () => {
  return new Date().toISOString();
};

export const generateRandomName = () => {
  const nouns = [
    "Test",
    "Scenario",
    "Flow",
    "Process",
    "Workflow",
    "Sequence",
    "Chain",
    "Path",
  ];
  const randomNum = Math.floor(Math.random() * 1000);
  return `${nouns[Math.floor(Math.random() * nouns.length)]} ${randomNum}`;
};

export const generateRandomDescription = () => {
  const descriptions = [
    "This scenario tests the basic functionality of the system",
    "A comprehensive test flow for critical operations",
    "End-to-end testing scenario for user interactions",
    "Performance testing scenario for system optimization",
    "Security validation scenario for data protection",
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
};

export const generateRandomValidation = () => {
  const validations = [
    "Response time < 200ms",
    "Success rate > 99%",
    "Error rate < 0.1%",
    "Data consistency check",
    "State transition validation",
  ];
  return validations[Math.floor(Math.random() * validations.length)];
};

export const generateRandomTestCaseDescription = () => {
  const descriptions = [
    "Verify the basic functionality of the feature",
    "Test the error handling mechanism",
    "Validate the data processing flow",
    "Check the boundary conditions",
    "Test the integration with other components",
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
};

export const generateRandomPrecondition = () => {
  const preconditions = [
    "시스템이 정상적으로 실행 중인 상태",
    "사용자가 로그인한 상태",
    "데이터베이스가 초기화된 상태",
    "네트워크 연결이 안정적인 상태",
    "필요한 리소스가 할당된 상태",
  ];
  return preconditions[Math.floor(Math.random() * preconditions.length)];
};

export const generateRandomExpectedResult = () => {
  const expectedResults = [
    "성공적으로 데이터가 저장됨",
    "에러 메시지가 정확히 표시됨",
    "요청한 데이터가 정확히 반환됨",
    "시스템이 정상적으로 응답함",
    "데이터가 올바르게 업데이트됨",
  ];
  return expectedResults[Math.floor(Math.random() * expectedResults.length)];
};

export const generateRandomTestStatus = () => {
  const statuses = [2, 3, 4, 5];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

export const generateRandomTestDataCategory = () => {
  const categories = ["path/query", "request", "response"];
  return categories[Math.floor(Math.random() * categories.length)];
};

export const generateRandomTestDataKoName = () => {
  const koNames = ["테스트", "테스트2", "테스트3"];
  return koNames[Math.floor(Math.random() * koNames.length)];
};

export const generateRandomTestDataName = () => {
  const names = ["test", "test2", "test3"];
  return names[Math.floor(Math.random() * names.length)];
};

export const generateRandomTestDataContext = () => {
  const contexts = ["path", "query", "body", "header"];
  return contexts[Math.floor(Math.random() * contexts.length)];
};

export const generateRandomTestDataType = () => {
  const types = ["string", "number", "boolean", "array", "object"];
  return types[Math.floor(Math.random() * types.length)];
};

export const generateRandomTestDataLength = () => {
  const lengths = [10, 20, 30];
  return lengths[Math.floor(Math.random() * lengths.length)];
};

export const generateRandomTestDataFormat = () => {
  const formats = ["text", "json", "xml"];
  return formats[Math.floor(Math.random() * formats.length)];
};

export const generateRandomTestDataDefaultValue = () => {
  const defaultValues = ["test", "test2", "test3"];
  return defaultValues[Math.floor(Math.random() * defaultValues.length)];
};

export const generateRandomTestDataRequired = () => {
  const required = [true, false];
  return required[Math.floor(Math.random() * required.length)];
};

export const generateRandomTestDataId = () => {
  const parents = [1, 2, 3];
  return parents[Math.floor(Math.random() * parents.length)];
};

export const generateRandomTestDataDesc = () => {
  const descs = ["테스트", "테스트2", "테스트3"];
  return descs[Math.floor(Math.random() * descs.length)];
};

export const generateRandomTestDataValue = () => {
  const values = ["test", "test2", "test3"];
  return values[Math.floor(Math.random() * values.length)];
};

export const CreateTestData = () => {
  return {
    paramId: generateRandomTestDataId(),
    category: generateRandomTestDataCategory(),
    koName: generateRandomTestDataKoName(),
    name: generateRandomTestDataName(),
    context: generateRandomTestDataContext(),
    type: generateRandomTestDataType(),
    length: generateRandomTestDataLength(),
    format: generateRandomTestDataFormat(),
    defaultValue: generateRandomTestDataDefaultValue(),
    required: generateRandomTestDataRequired(),
    parent: generateRandomTestDataName(),
    desc: generateRandomTestDataDesc(),
    value: generateRandomTestDataValue(),
  };
};

export const createTestCase = () => {
  return {
    tcId: `testcase-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}`,
    precondition: generateRandomPrecondition(),
    description: generateRandomTestCaseDescription(),
    expectedResult: generateRandomExpectedResult(),
    status: generateRandomTestStatus(),
    testDataList: Array.from({ length: 3 }, () => CreateTestData()),
  };
};

export const createScenario = () => {
  return {
    id: `scenario-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    name: generateRandomName(),
    description: generateRandomDescription(),
    validation: generateRandomValidation(),
    graph: `graph LR
    A[시작] --> B{조건 확인}
    B -->|성공| C[처리 실행]
    B -->|실패| D[에러 처리]
    C --> E[결과 검증]
    E -->|통과| F[성공 응답]
    E -->|실패| G[실패 응답]
    D --> H[에러 응답]
    F --> I[종료]
    G --> I
    H --> I`,
    testcaseList: [],
  };
};
