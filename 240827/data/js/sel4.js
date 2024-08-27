/**
* 키워드 데이터를 로드하고 화면에 출력하는 함수
*/
function sel4_getKeywordData() {
  data_KeyWord = loadData("keyWordData", data_KeyWord_default); // 로컬 스토리지에서 키워드 데이터 로드
  let str = "<table><tr><td></td><td>키워드</td><td>인정시간</td></tr>"; // 테이블 헤더 생성
  let imsi = sel4_mapToArray(data_KeyWord); // 맵을 배열로 변환
  for (let i = 0; i < imsi.length; i++) {
    // 각 키워드와 인정시간을 테이블 행으로 추가
    str += `<tr><td>
    ${i == 0 ? "" : `<input type="button" class="sel4_changeU" value="↑" style="padding: revert" onclick="sel4_changeNum('${i}', 'up')"><br>`}
    ${i == imsi.length - 1 ? "" : `<input type="button" class="sel4_changeD" value="↓" style="padding: revert" onclick="sel4_changeNum('${i}', 'down')">`}
    </td>
    <td><input type="text" id="k${i}" value="${imsi[i][0]}" oninput="sel4_changeData('keyword','${i}', this)"></td>
    <td><input type="text" id="t${i}" value="${imsi[i][1]}" oninput="sel4_changeData('time','${i}', this)"></td>
    <td><input type="button" value="삭제" onclick="sel4_deleteData('${imsi[i][0]}')"></td>`;
    str += `</tr>`;
  }
  str += `<tr><td colspan='4'><input type="button" value="추가" style="width:100%" onclick="sel4_addModal()"></td></tr></table>`;
  $("#sel4_demo").html(str); // 테이블을 화면에 출력
}

/**
* 키워드 순서를 변경하는 함수
* @param {number} dataNum - 변경할 데이터의 인덱스
* @param {string} type - 변경 타입 ('up', 'down', 'add')
* @param {Array} [data=null] - 추가할 데이터 (type이 'add'일 경우 필요)
* @returns {Map} - 변경된 키워드 데이터 맵
*/
function sel4_changeNum(dataNum, type, data = null) {
  let imsi = sel4_mapToArray(data_KeyWord); // 맵을 배열로 변환
  let imsiItem;
  if (type == "add") {
    imsi.splice(dataNum + 1, 0, data); // 데이터 추가
    return sel4_arrayToMap(imsi); // 배열을 맵으로 변환하여 반환
  }
  imsiItem = imsi.splice(dataNum, 1); // 데이터 삭제
  imsi.splice(type == "up" ? Number(dataNum) - 1 : type == "down" ? Number(dataNum) + 1 : dataNum, 0, imsiItem[0]); // 데이터 이동
  data_KeyWord = sel4_arrayToMap(imsi); // 배열을 맵으로 변환하여 저장
  saveData("keyWordData", data_KeyWord); // 로컬 스토리지에 데이터 저장
  sel4_getKeywordData(); // 키워드 데이터 갱신
}

/**
* 키워드 데이터를 변경하는 함수
* @param {string} type - 변경할 데이터 타입 ('keyword' 또는 'time')
* @param {number} i - 변경할 데이터의 인덱스
* @param {HTMLInputElement} obj - 입력 요소 객체
*/
function sel4_changeData(type, i, obj) {
  let imsi = sel4_mapToArray(data_KeyWord); // 맵을 배열로 변환
  if (obj.value.indexOf(`"`) != -1) {
    alert(`"는 입력할수 없습니다.`); // 입력값에 따옴표가 포함된 경우 경고
    obj.value = obj.value.replaceAll(`"`, ""); // 따옴표 제거
  }

  if (type == "keyword") {
    imsi[i][0] = obj.value; // 키워드 변경
  } else {
    imsi[i][1] = obj.value; // 인정시간 변경
  }
  data_KeyWord = sel4_arrayToMap(imsi); // 배열을 맵으로 변환하여 저장
  saveData("keyWordData", data_KeyWord); // 로컬 스토리지에 데이터 저장
}

/**
* 키워드 데이터를 추가하는 함수
*/
function sel4_addData() {
  let select = $("#sel4_addKeyWordSelect").val();
  let v1 = $("#sel4_addKeyWord").val();
  let v2 = $("#sel4_addKeyWordTime").val();
  if (v1 == "" || v1 == null || v1 == undefined || v2 == "" || v2 == null || v2 == undefined) return alert("빈칸이 존재합니다."); // 빈칸 확인
  if (select == "") data_KeyWord.set(v1, v2); // 새로운 키워드 추가
  else data_KeyWord = sel4_changeNum(select, "add", [v1, v2]); // 기존 키워드 변경
  saveData("keyWordData", data_KeyWord); // 로컬 스토리지에 데이터 저장
  modal_close(); // 모달 닫기
  sel4_getKeywordData(); // 키워드 데이터 갱신
}

/**
* 키워드 데이터를 삭제하는 함수
* @param {string} key - 삭제할 키워드
*/
function sel4_deleteData(key) {
  data_KeyWord.delete(key); // 키워드 삭제
  saveData("keyWordData", data_KeyWord); // 로컬 스토리지에 데이터 저장
  sel4_getKeywordData(); // 키워드 데이터 갱신
}

/**
* 키워드 추가 모달을 여는 함수
*/
function sel4_addModal() {
  let title = "키워드 추가", content = "";
  content += `<select id="sel4_addKeyWordSelect" class="sel4_select"><option value="">맨 마지막</option>`;
  let imsi_index = 0;
  data_KeyWord.forEach((_, k) => content += `<option value=${imsi_index++}>${k}</option>`); // 키워드 목록 추가
  content += `</select>&nbsp&nbsp`;
  content += `<input type="text" id="sel4_addKeyWord" placeholder="키워드명">&nbsp&nbsp`;
  content += `<input type="text" id="sel4_addKeyWordTime" placeholder="인정시간">&nbsp&nbsp`;
  content += `<input type="button" value="추가" onclick="sel4_addData()">`;
  modal_view(title, content); // 모달 열기
  $("#sel4_addKeyWord").focus(); // 키워드 입력창에 포커스
}

/**
* 모달을 여는 함수
* @param {string} title - 모달의 제목
* @param {string} content - 모달의 내용
*/
function modal_view(title, content) {
  $("#modal_view_title").html(title); // 모달 제목 설정
  $("#modal_view_content").html(content); // 모달 내용 설정
  $('#modal').css('display', 'block'); // 모달 표시
}

/**
* 키워드 데이터를 다운로드하는 함수
*/
function sel4_downloadKeywordData() {
  $("#sel4_demo2").html(sel4_mapToText(data_KeyWord)); // 키워드 데이터를 텍스트로 변환하여 화면에 출력
  let content = document.getElementById("sel4_demo").innerText;

  let blob = new Blob([content], { type: "text/plain" }); // Blob 객체 생성

  let a = document.createElement("a"); // 다운로드를 위한 a 태그 생성
  a.href = URL.createObjectURL(blob);
  a.download = "data.js";

  a.click(); // a 태그를 클릭하여 파일 다운로드
}

/**
* 맵을 텍스트로 변환하는 함수
* @param {Map} data - 변환할 맵 객체
* @returns {string} - 변환된 텍스트
*/
function sel4_mapToText(data) {
  let str = "let data_KeyWord = new Map([";
  str = "data_KeyWord = new Map([";
  data.forEach((i, k) => str += `["${k}", "${i}"],`); // 맵 데이터를 문자열로 변환
  str += "])";
  return str;
}

/**
* 맵을 배열로 변환하는 함수
* @param {Map} map - 변환할 맵 객체
* @returns {Array} - 변환된 배열
*/
function sel4_mapToArray(map) {
  return Array.from(map);
}

/**
* 배열을 맵으로 변환하는 함수
* @param {Array} array - 변환할 배열
* @returns {Map} - 변환된 맵 객체
*/
function sel4_arrayToMap(array) {
  return new Map(array.map(item => [item[0], item[1]]));
}
