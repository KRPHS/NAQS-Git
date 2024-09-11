/**
* 엑셀 파일의 데이터와 필터 목록을 저장하는 변수
*/
let sel2_Excel_data = [];
let sel2_filterList = ["garaData"];
let sel2_calData = [];
let sel2_searchLevel = 8;

/**
* 텍스트 파일에서 필터 목록을 읽는 함수
* @param {File} file - 읽을 파일 객체
*/
async function sel2_readTxt(file) {
  let returnStr = "";
  let text = await file.text(); // 파일의 텍스트 읽기
  let imsifilterList = text.split("\n"); // 텍스트를 줄 단위로 분할
  for (let i = 0; i < imsifilterList.length; i++) {
    imsifilterList[i] = imsifilterList[i].replaceAll("\r", ""); // 줄 끝의 캐리지 리턴 제거
    if (isEmpty(imsifilterList[i]) == 0) imsifilterList.splice(i, 1); // 빈 줄 제거
    else {
      returnStr += "등록 필터:" + imsifilterList[i]; // 필터 문자열 추가
      returnStr += "\n";
    }
  }
  returnStr += "";
  sel2_filterList = imsifilterList; // 필터 목록 갱신
  $("#sel2_txtView").html(returnStr); // 필터 목록을 화면에 출력
  sel2_run(null, 'init');
}

/**
* 엑셀 데이터를 처리하는 함수
* @param {Array} Excel_data - 엑셀 데이터 배열
* @param {string} [type=null] - 처리 타입 (init 또는 input)
*/
function sel2_run(Excel_data, type = null) {
  if (type == "init") sel2_calData = []; // 초기화
  else if(type == "input") {
    sel2_calData = [];
    sel2_Excel_data = Excel_data;
  } else sel2_Excel_data = Excel_data;

  let nameList = [];
  // 엑셀 데이터에서 성명 추출
  for (let i = 0; i < sel2_Excel_data.length; i++) if (isEmpty(sel2_Excel_data[i].성명) != 0) nameList.push(sel2_Excel_data[i].성명);
  nameList = [...new Set(nameList)]; // 중복 제거

  for (let name of nameList) {
    let searchList = sel2_nameSearch(name); // 이름으로 데이터 검색
    
    for (let sl1 = 0; sl1 < searchList.length; sl1++) {
      let keyWord = sel2_reg(searchList[sl1].제목);

      let searchKeyWordBack = "";
      let searchKeyWordFront = "";
      // 키워드 앞부분과 뒷부분 추출
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

  // 중복된 데이터 제거
  for (let calData1 = 0; calData1 < sel2_calData.length; calData1++) {
    for (let calData2 = 0; calData2 < sel2_calData.length; calData2++) {
      if (isEmpty(sel2_calData[calData1]) != 0 && isEmpty(sel2_calData[calData2]) != 0) {
        if (sel2_calData[calData1][0][""] == sel2_calData[calData2][1][""] && sel2_calData[calData1][1][""] == sel2_calData[calData2][0][""]) {
          sel2_calData.splice(calData1, 1);
        }
      }
    }
  }
  sel2_view(); // 결과를 화면에 출력
}

/**
* 결과를 화면에 출력하는 함수
*/
function sel2_view() {
  let str = "";
  let searchCnt = 1;
  for (let data of sel2_calData) {
    let okM1 = (Number(isEmpty(data[0].인정시간)) * 60) + (Number(isEmpty(data[0].인정시간분))); // 인정시간 계산
    let okM2 = (Number(isEmpty(data[1].인정시간)) * 60) + (Number(isEmpty(data[1].인정시간분)));
    str += ` < ` + searchCnt++ + ` > <b>` + data[0].성명 + `</b><br>`;
    str += `<table class='sel2result'><tr>`;
    str += `<td style='width: 110px;'>고번, 연계, 분</td>`;
    str += `<td class='point1'>${data[0][""]} / ${data[0].구분} / ${okM1}분</td>`;
    str += `<td class='point2'>${data[1][""]} / ${data[1].구분} / ${okM2}분</td>`;
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
* 검색 민감도를 설정하는 함수
* @param {number} searchLevel - 설정할 검색 민감도 수준
*/
function sel2_searchLevelCal(searchLevel) {
  sel2_searchLevel = Number(searchLevel);
  sel2_run(null, 'init');
}

/**
* 문자열에서 특정 패턴을 정규화하는 함수
* @param {string} str - 정규화할 문자열
* @returns {string} - 정규화된 문자열
*/
function sel2_reg(str) {
  str = str.trim();
  str = str.replace(/^\[.*?\]/, '');
  str = str.replace(/^\(.*?\)/, '');
  str = str.replace(/^\d{2,4}/, '');
  str = str.replace(/^년도/, '');
  str = str.replace(/^년/, '');
  return str;
}

/**
* 이름을 검색하는 함수
* @param {string} name - 검색할 이름
* @returns {Array} - 이름에 해당하는 데이터 배열
*/
function sel2_nameSearch(name) {
  let returnArr = [];
  for (let i = 0; i < sel2_Excel_data.length; i++) {
    for (let key in sel2_Excel_data[i]) if (key == "성명" && sel2_Excel_data[i][key] == name) returnArr.push(sel2_Excel_data[i]);
  }
  return returnArr;
}
