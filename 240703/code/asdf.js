// 현재 선택된 메인 메뉴의 아이디를 저장
let main_sel_menu = "sel1";
// 웹 버전 정보
const web_version = "240612";

/**
 * 엑셀 파일을 읽어서 데이터 처리
 * @param {string} type - 처리할 데이터의 타입
 */
function readExcel(type) {
  let input = event.target;
  let reader = new FileReader();
  reader.onload = function () {
    let data = reader.result;
    let workBook = XLSX.read(data, { type: 'binary' });

    workBook.SheetNames.forEach(function (sheetName) {
      let rows = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);
      if (type == 'sel1') {
        sel1_run(rows);
      } else if (type == 'sel2') {
        sel2_run(rows);
      }
    })
  };
  reader.readAsBinaryString(input.files[0]);
}

/**
 * 스크롤 이벤트 리스너
 * 로고의 애니메이션을 조절
 */
window.addEventListener('scroll', function () {
  if (window.scrollY == 0) {
    $("#logo").css("animation", "logoB 0.2s forwards");
  } else {
    $("#logo").css("animation", "logoS 0.2s forwards");
  }
});

/**
 * 메인 메뉴 선택
 * @param {string} sel_id - 선택된 메뉴의 아이디
 */
function main_menu_select(sel_id) {
  sel_id = sel_id.replace("menu_", "");

  if (main_sel_menu == sel_id) return;

  $('#' + sel_id).slideDown(500);
  $('#menu_' + sel_id).addClass("menu_sel");
  $('#menu_' + main_sel_menu).removeClass("menu_sel");
  $('#' + main_sel_menu).slideUp(500);
  main_sel_menu = sel_id;
  titleRefresh();
}

let data_KeyWord;
/**
 * DOMContentLoaded 이벤트 리스너
 * 페이지가 로드되면 데이터 불러오기
 */
document.addEventListener("DOMContentLoaded", function () {
  data_KeyWord = loadData('keyWordData', data_KeyWord_default);
});

// 기본 키워드 데이터 설정
let data_KeyWord_default = new Map([
  ["폭력예방", "240"],
  ["성인지", "60"],
  ["반부패?청렴", "900.120"],
  ["갑질왕", "60"],
  ["통일", "0"],
  ["장애", "60"],
  ["아동학대", "60"],
  ["긴급지원", "60"],
  ["중대재해", "80"],
  ["적극적", "90"],
  ["정보공개", "60"],
  ["이해충돌", "0"],
  ["공직가치", "50"],
  ["역사", "60"],
  ["답하라", "60"],
  ["첫걸음", "60"],
  ["매력적", "60"],
  ["메타버스", "60"],
  ["네트워크", "120"],
  ["개인정보보호", "60"],
  ["안보교육", "0"]
])

/**
 * 데이터를 로컬 스토리지에 저장
 * @param {string} name - 저장할 데이터의 이름
    * @param {Map} data - 저장할 데이터
    */
function saveData(name, data) {
  localStorage.setItem(name, sel4_mapToText(data));
}

/**
 * 로컬 스토리지에서 데이터 불러오기
 * @param {string} name - 불러올 데이터의 이름
    * @param {Map} defaultData - 기본 데이터
    * @returns {Map} - 불러온 데이터 또는 기본 데이터
    */
function loadData(name, defaultData) {
  let data = eval(localStorage.getItem(name));
  if (data) {
    return data;
  } else {
    alert("저장된 데이터가 없어 초기값으로 데이터를 가져왔습니다.");
    saveData(name, defaultData);
    return defaultData;
  }
}

let sel1_Excel_data = [];
let sel1_calData = new Map();
let sel1_nameList = [];
let sel1_keyWordList = data_KeyWord;

/**
 * 텍스트 파일을 읽어서 데이터 처리
 * @param {File} file - 읽을 파일
    * @param {string} type - 처리할 데이터의 타입
    * @returns {Promise} - 읽기 작업 완료 후 반환되는 Promise
    */
async function sel1_readTxt(file, type) {
  let returnStr = "";
  let text = await file.text();
  if (type == "keyword") {
    sel1_keyWordList.clear();
    let imsiKeyWordList = text.split("\n");
    for (let i = 0; i < imsiKeyWordList.length; i++) {
      imsiKeyWordList[i] = imsiKeyWordList[i].split("/")[1] == undefined ? console.log("keyword is null") : imsiKeyWordList[i].split("/");
      sel1_keyWordList.set(imsiKeyWordList[i][0], imsiKeyWordList[i][1].replaceAll("\r", ""));
      returnStr += "등록 키워드: " + imsiKeyWordList[i][0] + " // 인정시간: " + imsiKeyWordList[i][1] + (isEmpty(imsiKeyWordList[i][2]) == 0 ? "" : " // 제외 키워드: " + imsiKeyWordList[i][2]) + "\n";
    }
    $("#sel1_keyword_table").html(returnStr);
  } else if (type == "name") {
    sel1_nameList = [];
    sel1_nameList = text.split("\n");
    for (let i = 0; i < sel1_nameList.length; i++) {
      sel1_nameList[i] = sel1_nameList[i].replaceAll("\r", "");
      if (sel1_nameList[i] == "" || sel1_nameList[i] == " ") sel1_nameList.splice(i);
      isEmpty(sel1_nameList[i]) == 0 ? console.log("name is null") : returnStr += "" + sel1_nameList[i] + "\n";
    }
    returnStr = `총 인원 ${sel1_nameList.length}명\n${returnStr}`;
    $("#sel1_name_table").html(returnStr);
  }
}

/**
 * 엑셀 데이터를 기반으로 계산을 실행하고 뷰를 업데이트
 * @param {Array} Excel_data - 엑셀 데이터 배열
    */
function sel1_run(Excel_data) {
  sel1_keyWordList = data_KeyWord;
  sel1_Excel_data = Excel_data;
  // sel1_calData 초기화
  for (let i = 0; i < sel1_nameList.length; i++) {
    let sel1_imsiData = [];
    sel1_keyWordList.forEach((_, key) => {
      sel1_imsiData.push([key, "X", 0, []])
    })
    sel1_calData.set(sel1_nameList[i], sel1_imsiData);
  }
  // 실행
  for (let name of sel1_nameList) {
    let searchList = sel1_nameSearch(name);
    for (let i = 0; i < searchList.length; i++) {
      sel1_keyWordList.forEach((data, keyWord) => {
        if (keyWord.indexOf(",") == -1) {
          if (keyWord.indexOf("?") == -1) sel1_data_calc(keyWord, data, searchList[i]);
          else keyWord.replaceAll(" ", "").split("?").forEach(value => { sel1_data_calc(value, data, searchList[i]); });
        } else {
          keyWord.replaceAll(" ", "").split(",").forEach(splitKeyWord => {
            if (splitKeyWord.indexOf("?") == -1) sel1_data_calc(splitKeyWord, data, searchList[i]);
            else splitKeyWord.replaceAll(" ", "").split("?").forEach(value => { sel1_data_calc(value, data, searchList[i]); });
          });
        }
      });
    }
  }
  sel1_view();
}

/**
 * 주어진 이름을 가진 항목을 검색하여 배열로 반환
 * @param {string} name - 검색할 이름
    * @returns {Array} - 검색된 항목 배열
    */
function sel1_nameSearch(name) {
  let returnArr = [];
  for (let i = 0; i < sel1_Excel_data.length; i++) {
    for (let key in sel1_Excel_data[i]) if (key == "성명" && sel1_Excel_data[i][key] == name) returnArr.push(sel1_Excel_data[i]);
  }
  return returnArr;
}

/**
 * 주어진 이름과 키워드를 가진 항목을 검색하여 배열로 반환
 * @param {string} name - 검색할 이름
    * @param {string} keyWord - 검색할 키워드
    * @returns {Array} - 검색된 항목 배열
    */
function sel1_keyWordSearch(name, keyWord) {
  let returnArr = [];
  for (let i = 0; i < sel1_Excel_data.length; i++) {
    for (let key in sel1_Excel_data[i]) {
      if (key == "성명" && sel1_Excel_data[i][key] == name && sel1_Excel_data[i].제목.indexOf(keyWord) != -1) {
        returnArr.push(sel1_Excel_data[i]);
      }
    }
  }
  return returnArr;
}

/**
 * 주어진 데이터를 sel1_calData에 추가
 * @param {string} searchKeyWord - 찾고자 하는 키워드
    * @param {string} okTime - 인정시간
    * @param {Object} data - 추가할 데이터
    */
function sel1_data_calc(searchKeyWord, okTime, data) {
  let okM = 0;
  if (data.제목.indexOf(searchKeyWord) != -1) {
    okM = (data.인정시간 + "").indexOf(":") != -1 ? Number(isEmpty((data.인정시간 + "").split(":")[1])) + (Number(isEmpty((data.인정시간 + "").split(":")[0])) * 60) : Number(isEmpty(data.인정시간분)) + (Number(isEmpty(data.인정시간)) * 60);

    for (let i = 0; i < sel1_calData.get(data.성명).length; i++) {
      for (let j = 0; j < sel1_calData.get(data.성명)[i][3].length; j++) {
        if (sel1_calData.get(data.성명)[i][3][j][""] == data[""] && sel1_calData.get(data.성명)[i][0].indexOf(searchKeyWord) != -1) return;
      }
      if (sel1_calData.get(data.성명)[i][0].indexOf(searchKeyWord) != -1) {
        okM += Number(sel1_calData.get(data.성명)[i][2]);
        sel1_calData.get(data.성명)[i][2] = okM;
        if (okTime.indexOf(".") == -1) {
          if (sel1_calData.get(data.성명)[i][2] < okTime && sel1_calData.get(data.성명)[i][2] > 0) sel1_calData.get(data.성명)[i][1] = "▲";
          else if (sel1_calData.get(data.성명)[i][2] >= okTime) sel1_calData.get(data.성명)[i][1] = "O";
        } else {
          let imsiArr = okTime.replaceAll(" ", "").split(".");
          if (sel1_calData.get(data.성명)[i][2] < imsiArr[0] && sel1_calData.get(data.성명)[i][2] > 0 && sel1_calData.get(data.성명)[i][1] != "O") sel1_calData.get(data.성명)[i][1] = "▲";
          else if (sel1_calData.get(data.성명)[i][2] >= imsiArr[0]) sel1_calData.get(data.성명)[i][1] = "O";
          if (imsiArr[1] == okM) sel1_calData.get(data.성명)[i][1] = "O";
        }
        sel1_calData.get(data.성명)[i][3].push(data);
      }
    }
  }
}

/**
 * sel1_calData를 기반으로 테이블을 생성하여 뷰를 업데이트
 */
function sel1_view() {
  sel1_keyWordList = data_KeyWord;
  let str = "<table style='border: 2px solid black'><tr id='tableHeader_sel1'><td style='width:70px'></td>";
  sel1_keyWordList.forEach((_, k) => { str += `<td>${k}</td>`; })
  str += "</tr>";
  if ($('#view_Btn').val() == '시간 미포함') {
    sel1_nameList.forEach(name => {
      let arr = sel1_calData.get(name);
      str += `<tr><td>${name}</td>`;
      for (let i = 0; i < arr.length; i++) {
        str += `<td>${arr[i][1]}</td>`;
      }
      str += "</tr>";
    })
    $('#view_Btn').val('시간 포함');
  } else if ($('#view_Btn').val() == '시간 포함') {
    sel1_nameList.forEach(name => {
      let arr = sel1_calData.get(name);
      str += `<tr><td style="border-bottom: .6px solid gray;">${name}<br><input type='button' class='modalViewBtn' value=' ? ' onclick="sel1_modalView('${name}','', 'multi')"></td>`;
      for (let i = 0; i < arr.length; i++) {
        str += `<td style="border-bottom: .6px solid gray;">${arr[i][1] == "X" ? "<span style='color: red'>" + arr[i][1] + "</span>" : arr[i][1]},<br> ${arr[i][2]}<br><input type='button' class='modalViewBtn' value=' ? ' onclick="sel1_modalView('${name}','${arr[i][0]}', 'single')"></td>`;
      }
      str += "</tr>";
    })
    $('#view_Btn').val('시간 미포함');
  }
  str += "</table>";
  $("#sel1_demo").html(str);
}

/**
 * 모달 뷰를 표시
 * @param {string} name - 이름
    * @param {string} keyWord - 키워드
    * @param {string} type - 모달 타입 (single, multi)
    */
function sel1_modalView(name, keyWord, type) {
  let str = "";
  let fullTime = 0;
  for (let i = 0; i < sel1_calData.get(name).length; i++) {
    let data = sel1_calData.get(name)[i];
    if (type == "single") {
      if (data[0].indexOf(keyWord) != -1) {
        for (let j = 0; j < data[3].length; j++) {
          let okM = 0;
          okM = (data[3][j].인정시간 + "").indexOf(":") != -1 ? Number(isEmpty((data[3][j].인정시간 + "").split(":")[1])) + (Number(isEmpty((data[3][j].인정시간 + "").split(":")[0])) * 60) : Number(isEmpty(data[3][j].인정시간분)) + (Number(isEmpty(data[3][j].인정시간)) * 60);
          str += "<p>" + data[3][j].제목 + " <b>(" + okM + "분)</b></p>";
          fullTime += okM;
        }
      }
    } else if (type == "multi") {
      str += `<hr><h3>${data[0]} ${data[1]}</h3>`;
      for (let j = 0; j < data[3].length; j++) {
        let okM = 0;
        okM = (data[3][j].인정시간 + "").indexOf(":") != -1 ? Number(isEmpty((data[3][j].인정시간 + "").split(":")[1])) + (Number(isEmpty((data[3][j].인정시간 + "").split(":")[0])) * 60) : Number(isEmpty(data[3][j].인정시간분)) + (Number(isEmpty(data[3][j].인정시간)) * 60);
        str += "<p>" + data[3][j].제목 + " <b>(" + okM + "분)</b></p>";
        fullTime += okM;
      }
    }
  }
  $("#modal_view_title").html(`${name} (${Math.floor(fullTime / 60)}시간 ${fullTime % 60}분)`);
  $("#modal_view_content").html(str);
  $('#modal').css('display', 'block');
}

/**
 * 모달 뷰 닫기
 */
function modal_close() {
  $('#modal').css('display', 'none');
}

/**
 * 문자열이 비었는지 확인
 * @param {string} str - 확인할 문자열
    * @returns {number} - 문자열이 비었으면 0, 그렇지 않으면 문자열 반환
    */
function isEmpty(str) {
  if (typeof str == undefined || str == null || str == "") return 0;
  else return str;
}

/**
 * 파일 이름을 파일 선택기에서 읽어서 표시
 */
$(document).ready(function () {
  var fileTarget = $('.filebox .upload-hidden');

  fileTarget.on('change', function () {
    if (window.FileReader) {  // modern browser
      var filename = $(this)[0].files[0].name;
    }
    else {  // old IE
      var filename = $(this).val().split('/').pop().split('\\').pop();  // 파일명만 추출
    }
    $(this).siblings('.upload-name').val(filename);
  });
});

/**
 * Map 데이터를 텍스트로 변환
 * @param {Map} data - 변환할 데이터
    * @returns {string} - 변환된 텍스트
    */
function sel4_mapToText(data) {
  let str = "let data_KeyWord = new Map([";
  str = "data_KeyWord = new Map([";
  data.forEach((i, k) => str += `["${k}", "${i}"],`);
  str += "])";
  return str;
}

/**
 * Map 데이터를 배열로 변환
 * @param {Map} map - 변환할 Map 데이터
    * @returns {Array} - 변환된 배열
    */
function sel4_mapToArray(map) {
  return Array.from(map);
}

/**
 * 배열 데이터를 Map으로 변환
 * @param {Array} array - 변환할 배열
    * @returns {Map} - 변환된 Map 데이터
    */
function sel4_arrayToMap(array) {
  return new Map(array.map(item => [item[0], item[1]]));
}

let sel2_Excel_data = [];
let sel2_filterList = ["garaData"];
let sel2_calData = [];
let sel2_searchLevel = 8;

/**
 * 텍스트 파일을 읽어 필터 목록을 갱신
 * @param {File} file - 읽을 파일
    */
async function sel2_readTxt(file) {
  let returnStr = "";
  let text = await file.text();
  let imsifilterList = text.split("\n");
  for (let i = 0; i < imsifilterList.length; i++) {
    imsifilterList[i] = imsifilterList[i].replaceAll("\r", "");
    if (isEmpty(imsifilterList[i]) == 0) imsifilterList.splice(i, 1);
    else {
      returnStr += "등록 필터:" + imsifilterList[i];
      returnStr += "\n";
    }
  }
  returnStr += "";
  sel2_filterList = imsifilterList;
  $("#sel2_txtView").html(returnStr);
  sel2_run(null, 'init');
}

/**
 * 엑셀 데이터를 기반으로 중복 확인 작업 실행
 * @param {Array} Excel_data - 엑셀 데이터 배열
    * @param {string} type - 실행 타입 (init, input)
    */
function sel2_run(Excel_data, type = null) {
  if (type == "init") sel2_calData = [];
  else if (type == "input") {
    sel2_calData = [];
    sel2_Excel_data = Excel_data;
  } else sel2_Excel_data = Excel_data;

  let nameList = [];
  for (let i = 0; i < sel2_Excel_data.length; i++) if (isEmpty(sel2_Excel_data[i].성명) != 0) nameList.push(sel2_Excel_data[i].성명);
  nameList = [...new Set(nameList)];

  for (let name of nameList) {
    let searchList = sel2_nameSearch(name);
    for (let sl1 = 0; sl1 < searchList.length; sl1++) {
      let keyWord = sel2_reg(searchList[sl1].제목);

      let searchKeyWordBack = "";
      let searchKeyWordFront = "";
      if (keyWord.length >= sel2_searchLevel) {
        searchKeyWordFront = keyWord.substr(0, sel2_searchLevel);
        searchKeyWordBack = keyWord.substr(keyWord.length - sel2_searchLevel, keyWord.length);
      } else {
        searchKeyWordFront = keyWord.substr(0, keyWord.length);
        searchKeyWordBack = keyWord.substr(0, keyWord.length);
      }

      for (let sl2 = 0; sl2 < searchList.length; sl2++) {
        if (searchList[sl1][""] != searchList[sl2][""]) {
          for (let filterKeyWord of sel2_filterList) {
            if (searchList[sl2].제목.indexOf(searchKeyWordFront) != -1 && searchList[sl2].제목 != filterKeyWord && filterKeyWord != "") {
              sel2_calData.push([searchList[sl1], searchList[sl2]]);
            } else if (searchList[sl2].제목.indexOf(searchKeyWordBack) != -1 && searchList[sl2].제목 != filterKeyWord && filterKeyWord != "") {
              sel2_calData.push([searchList[sl1], searchList[sl2]]);
            }
          }
        }
      }
    }
  }

  for (let calData1 = 0; calData1 < sel2_calData.length; calData1++) {
    for (let calData2 = 0; calData2 < sel2_calData.length; calData2++) {
      if (isEmpty(sel2_calData[calData1]) != 0 && isEmpty(sel2_calData[calData2]) != 0) {
        if (sel2_calData[calData1][0][""] == sel2_calData[calData2][1][""] && sel2_calData[calData1][1][""] == sel2_calData[calData2][0][""]) {
          sel2_calData.splice(calData1, 1);
        }
      }
    }
  }
  sel2_view();
}

/**
 * sel2_calData를 기반으로 테이블을 생성하여 뷰를 업데이트
 */
function sel2_view() {
  let str = "";
  let searchCnt = 1;
  for (let data of sel2_calData) {
    let okM1 = (Number(isEmpty(data[0].인정시간)) * 60) + (Number(isEmpty(data[0].인정시간분)));
    let okM2 = (Number(isEmpty(data[1].인정시간)) * 60) + (Number(isEmpty(data[1].인정시간분)));
    str += ` < ` + searchCnt++ + ` > <b>` + data[0].성명 + `</b><br>`;
    str += `<table class='sel2result'><tr>`;
    str += `<td style='width: 110px;'>고번, 연계, 분</td>`;
    str += `<td class='point1'>${data[0][""]} / 연계 / ${okM1}분</td>`;
    str += `<td class='point2'>${data[1][""]} / 연계 / ${okM2}분</td>`;
    str += `</tr><tr>`;
    str += `<td>제목</td>`;
    str += `<td class='point1'>${data[0].제목}</td>`;
    str += `<td class='point2'>${data[1].제목}</td>`;
    str += `</tr></table>`;
    str += `<hr>`;
  }
  str = "발견된 개수: " + (searchCnt - 1) + "<hr>" + str;
  $('#sel2_demo').html(str);
}

/**
 * 검색 민감도 조정
 * @param {number} searchLevel - 검색 민감도 수준
          */
function sel2_searchLevelCal(searchLevel) {
  sel2_searchLevel = Number(searchLevel);
  sel2_run(null, 'init');
}

/**
 * 문자열에서 불필요한 부분 제거
 * @param {string} str - 정리할 문자열
          * @returns {string} - 정리된 문자열
          */
function sel2_reg(str) {
  str = str.trim();

  str = str.replace(/^\[.*?\]/, '');
  str = str.replace(/^\(.*?\)/, '');
  str = str.replace(/^\d{2, 4}/, '');
  str = str.replace(/^년도/, '');
  str = str.replace(/^년/, '');

  return str;
}

/**
 * 주어진 이름을 가진 항목을 검색하여 배열로 반환
 * @param {string} name - 검색할 이름
          * @returns {Array} - 검색된 항목 배열
          */
function sel2_nameSearch(name) {
  let returnArr = [];
  for (let i = 0; i < sel2_Excel_data.length; i++) {
    for (let key in sel2_Excel_data[i]) if (key == "성명" && sel2_Excel_data[i][key] == name) returnArr.push(sel2_Excel_data[i]);
  }
  return returnArr;
}

/**
 * 타이틀을 새로 고침
 */
function titleRefresh() {
  document.title = $("#menu_" + main_sel_menu).text() + " " + web_version;
}
titleRefresh();