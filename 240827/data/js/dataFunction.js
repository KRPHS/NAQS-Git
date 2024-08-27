/**
* 데이터를 로컬 스토리지에 저장하는 함수
* @param {string} name - 저장할 데이터의 이름
* @param {any} data - 저장할 데이터
*/
function saveData(name, data) {
  try {
    localStorage.setItem(name, sel4_mapToText(data)); // 로컬 스토리지에 데이터 저장
  } catch (e) {
    if (e == QUOTA_EXCEEDED_ERR) alert("저장공간 용량 초과"); // 저장 공간 초과 시 경고
  }
}

/**
* 로컬 스토리지에서 데이터를 로드하는 함수
* @param {string} name - 로드할 데이터의 이름
* @param {any} defaultData - 기본 데이터 (데이터가 없을 경우 사용)
* @returns {any} - 로드된 데이터 또는 기본 데이터
*/
function loadData(name, defaultData) {
  let data = eval(localStorage.getItem(name)); // 로컬 스토리지에서 데이터 가져오기
  if (data) {
    return data; // 데이터가 있을 경우 반환
  } else {
    alert("저장된 데이터가 없어 초기값으로 데이터를 가져왔습니다.");
    saveData(name, defaultData); // 데이터가 없을 경우 기본 데이터 저장
    return defaultData; // 기본 데이터 반환
  }
}

/**
* 데이터를 텍스트 파일로 저장하는 함수
* @param {string} itemName - 저장할 데이터의 이름
*/
function saveDataFile(itemName) {
  let item = eval(localStorage.getItem(itemName)); // 로컬 스토리지에서 데이터 가져오기
  let str = "";
  item.forEach((i, k) => str += `${k}/${i}\n`); // 데이터를 문자열로 변환
  downloadTextFile(str); // 파일 다운로드
}

/**
* 파일에서 데이터를 로드하는 함수
* @param {File} file - 로드할 파일 객체
* @param {string} itemName - 로드한 데이터를 저장할 로컬 스토리지의 이름
*/
async function loadDataFile(file, itemName) {
  let text = await file.text(); // 파일의 텍스트 읽기
  let imsiKeyWordList = text.split("\n"); // 텍스트를 줄 단위로 분할
  imsiKeyWordList.splice(imsiKeyWordList.length - 1, 1); // 마지막 줄 제거
  for (let i = 0; i < imsiKeyWordList.length; i++) {
    imsiKeyWordList[i] = imsiKeyWordList[i].split("/")[1] == undefined ? console.log("keyword is null") : imsiKeyWordList[i].replaceAll("\r", "").split("/"); // 줄을 키워드와 값으로 분할
  }
  console.log(imsiKeyWordList);
  imsiKeyWordList = sel4_arrayToMap(imsiKeyWordList); // 배열을 맵으로 변환
  saveData(itemName, imsiKeyWordList); // 로컬 스토리지에 데이터 저장
  sel4_getKeywordData(); // 키워드 데이터 갱신
}

/**
* 텍스트 파일을 다운로드하는 함수
* @param {string} data - 다운로드할 데이터
*/
function downloadTextFile(data) {
  let filename = "서무키워드"; // 파일 이름
  const blob = new Blob([data], { type: 'text/plain' }); // Blob 객체 생성
  const url = URL.createObjectURL(blob); // Blob URL 생성
  const a = document.createElement('a'); // 다운로드를 위한 a 태그 생성
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click(); // a 태그를 클릭하여 파일 다운로드
  document.body.removeChild(a); // 사용 후 a 태그 제거
  URL.revokeObjectURL(url); // URL 해제
}
