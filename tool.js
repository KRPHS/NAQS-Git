const imsiArrayList = {};
function setData(name, data) {
  imsiArrayList[name] = data;
}
function getData(name) {
  return imsiArrayList.hasOwnProperty(name) ? imsiArrayList[name] : undefined;
}

function setHeader(name, data) {
  imsiArrayList[name + "header"] = data;
}
function getHeader(name) {
  return imsiArrayList.hasOwnProperty(name + "header") ? imsiArrayList[name + "header"] : undefined;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function tableToExcel(tableID, downloadName) {
  XLSX.writeFile(XLSX.utils.table_to_book(document.getElementById(tableID), { sheet: "Sheet1" }), downloadName + '.xlsx');
}

function readExcel() {
  let input = event.target;
  if (input.id == "") {
    alert("해당 input태그의 아이디를 지정해주세요.");
    input.value = "";
    return;
  }
  let reader = new FileReader();
  reader.onload = function () {
    let data = reader.result;
    let workBook = XLSX.read(data, { type: 'binary' });

    workBook.SheetNames.forEach(function (SheetNames) {
      let rows = XLSX.utils.sheet_to_json(workBook.Sheets[SheetNames]);

      setData(input.id, rows);
      setData(input.id + "header", excelGetHeader(rows));
    })
  };
  reader.readAsBinaryString(input.files[0]);
}

function excelGetHeader(data) {
  return Object.keys(data[0]);
}

function readTxtFile() {
  var input = event.target;

  if (input.files.length > 0) {
    var file = input.files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
      var content = e.target.result;
      setData(input.id, content);
    };
    reader.readAsText(file);
  } else {
    alert('파일을 선택해주세요.');
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * 선택된 id에 데이터를 출력해줌
 * @param {String} objID 데이터를 출력할 태그의 id
 * @param {String} value 출력할 내용
 */
function view(objID, value) {
  document.getElementById(objID).innerHTML = value;
}

/**
 * @param {출력을 원하는 곳의 ID} outId 데이터를 출력할 태그의 id
 * @param {데이터를 불러올 id} value_id 데이터를 불러올 id
 */
function excelView(outId, value_id) {
  if (typeof value_id !== "string") return;

  let headerArr = getData(value_id + "header");
  let data = getData(value_id);

  let tableRows = data.map(row => {
    let rowData = headerArr.map(header => { return `<td>${row[header] === undefined ? option_excelData_null : row[header]}</td>`; }).join("");
    return `<tr>${rowData}</tr>`;
  }).join("");

  let tableHTML = `<table><tr>${headerArr.map(header => `<td>${header}</td>`).join("")}</tr>${tableRows}</table>`;

  document.getElementById(outId).innerHTML = tableHTML;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * array[Object] 형식을 테이블로 출력해줌
 * @param {*} outID 출력할 ID 
 * @param {*} headerArr 헤더 리스트
 * @param {*} data 출력 데이터
 */
function arrayToTableView(outID, headerArr, data) {
  if (!data || data.length == 0) return document.getElementById(outID).innerHTML = "데이터가 없습니다.";

  let tableRows = data.map(row => {
    let rowData = headerArr.map(header => { return `<td>${row[header] === undefined ? option_excelData_null : row[header]}</td>`; }).join("");
    return `<tr>${rowData}</tr>`; 
  }).join("");

  let tableHTML = `<table><tr>${headerArr.map(header => `<td>${header}</td>`).join("")}</tr>${tableRows}</table>`;

  document.getElementById(outID).innerHTML = tableHTML;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/** 
 * @param {아이디} id 값의 유무를 확인하고 싶은 ID를 입력해주세요. 
 */
function test(id) {
  let data = getData(id);
  console.log(data ? "데이터 있음" : "데이터 없음");
  if (data) console.table(data);
}

function now() {
  return new Date().toISOString().replace(/\D/g, '').slice(0, -1);
}

function comma(str) {
  return str.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// let keyWordFilter = (excelData, header, keywords) => excelData.filter(obj => (Array.isArray(keywords) ? keywords : keywords.split(",")).every(keyword => (obj[header] + "").includes(keyword.trim())));
// 입력한 키워드가 모두 포함되는 데이터 키워드는 "키1,키2" 또 는 ["키1", "키2"]로 입력
function keyWordFilter(excelData, header, keywords) {
  if (!excelData) return;
  return excelData.filter(obj => (Array.isArray(keywords) ? keywords : keywords.split(",")).every(keyword => (obj[header] + "").includes(keyword.trim())));
}
// 키워드중 하나라도 포함되는 데이터
function keyWordORFilter(excelData, header, keywords) {
  if (!excelData) return;
  return excelData.filter(obj => (Array.isArray(keywords) ? keywords : keywords.split(",")).some(keyword => (obj[header] + "").includes(keyword.trim())));
}

// 키워드가 모두 포함 안되는 데이터
function notKeyWordFilter(excelData, header, keywords) {
  if (!excelData) return;
  return excelData.filter(obj => !(Array.isArray(keywords) ? keywords : keywords.split(",")).every(keyword => (obj[header] + "").includes(keyword.trim())));
}
// 키워드중 하나라도 포함 안되는 데이터
function notKeyWordORFilter(excelData, header, keywords) {
  if (!excelData) return;
  return excelData.filter(obj => !(Array.isArray(keywords) ? keywords : keywords.split(",")).some(keyword => (obj[header] + "").includes(keyword.trim())));
}

// 열 추가
function addColumn(id, header) {
  setHeader(id, getHeader(id).concat(header));
  return getData(id).map(obj => ({ ...obj, [header]: "" }));
}

// 열 삭제
function deleteColumn(id, header) {
  setHeader(id, getHeader(id).filter(h => h !== header));
  return getData(id).map(obj => (delete obj[header], obj));
}

// (데이터1, 데이터1헤더, 비교연산자, 비교값)
function numberFilter(data1, header1, operator, value) {
  if (!data1 || !header1 || value === undefined || isNaN(Number(value))) {
    console.error('입력이 유효하지 않습니다.');
    return false;
  }

  value = Number(value);

  return data1.filter(obj => !isNaN(obj[header1]) && eval(`Number(obj[header1]) ${operator} ${value}`));
}