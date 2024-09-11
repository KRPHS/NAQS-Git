/**
 * 데이터를 로컬 스토리지에 저장하는 함수
 * @param {string} name - 데이터 이름
 * @param {object} data - 저장할 데이터 객체
 */
function saveData(name, data, test = null) {
  localStorage.setItem(name, JSON.stringify(data).replaceAll("\\", ""));
}

/**
* 로컬 스토리지에서 데이터를 로드하는 함수
* @param {string} name - 데이터 이름
* @param {object} defaultData - 기본 데이터 객체
* @returns {object} 로드된 데이터 객체
*/
function loadData(name, defaultData) {
  let data;
  try {
      data = JSON.parse(localStorage.getItem(name));
  } catch (error) {
      data = "null";
  }
  if (data) {
      return data;
  } else {
      alert("저장된 데이터가 없어 초기값으로 데이터를 가져왔습니다.");
      saveData(name, defaultData);
      return defaultData;
  }
}

/**
* 데이터를 텍스트 파일로 저장하는 함수
* @param {string} itemName - 저장할 데이터의 이름
*/
function saveDataFile(itemName) {
  let item = localStorage.getItem(itemName); // 로컬 스토리지에서 데이터 가져오기
  downloadTextFile(item); // 파일 다운로드
}

/**
* 파일에서 데이터를 로드하는 함수
* @param {File} file - 로드할 파일 객체
* @param {string} itemName - 로드한 데이터를 저장할 로컬 스토리지의 이름
*/
async function loadDataFile(file, itemName) {
  let text = await file.text(); // 파일의 텍스트 읽기
  text = text.replaceAll('\"', '"');
  text = "data_location_km = " + text;
  saveData(itemName, data_location_km); // 로컬 스토리지에 데이터 저장
  
  eval(text);
  sel3_getViewKm(); // 키워드 데이터 갱신
}

/**
* 텍스트 파일을 다운로드하는 함수
* @param {string} data - 다운로드할 데이터
*/
function downloadTextFile(data) {
  let filename = "경리출장표"; // 파일 이름
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