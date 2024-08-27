/**
* 엑셀 파일의 데이터와 계산된 데이터를 저장하는 변수
*/
let sel3_Excel_data = [];
let sel3_calData = [];
let sel3_keyWordList = [];

// 키워드 리스트를 초기화
data_KeyWord.forEach((i,k) => sel3_keyWordList.push([k, i]));

/**
* 텍스트 파일에서 키워드 목록을 읽는 함수
* @param {File} file - 읽을 파일 객체
* @param {string} type - 파일 타입 (keyword)
*/
async function sel3_readTxt(file, type) {
  let returnStr = "";
  let text = await file.text(); // 파일의 텍스트 읽기
  if (type == "keyword") {
    sel3_keyWordList = [];
    let imsiKeyWordList = text.split("\n"); // 텍스트를 줄 단위로 분할
    for (let i = 0; i < imsiKeyWordList.length; i++) {
      imsiKeyWordList[i] = imsiKeyWordList[i].split("/")[1] == undefined ? console.log("keyword is null") : imsiKeyWordList[i].split("/"); // 줄을 키워드와 값으로 분할
      sel3_keyWordList.push([imsiKeyWordList[i][0], imsiKeyWordList[i][1].replaceAll("\r", "")]); // 키워드 리스트에 추가
      returnStr += "등록 키워드: " + imsiKeyWordList[i][0] + " // 인정시간: " + imsiKeyWordList[i][1] + (isEmpty(imsiKeyWordList[i][2]) == 0 ? "" : " // 제외 키워드: " + imsiKeyWordList[i][2]) + "\n";
    }
    $("#sel3_keyword_table").html(returnStr); // 키워드 테이블에 출력
  }
}

/**
* 엑셀 데이터를 처리하는 함수
* @param {Array} Excel_data - 엑셀 데이터 배열
*/
function sel3_run(Excel_data) {
  sel3_Excel_data = Excel_data; // 엑셀 데이터 저장
  sel3_calData = []; // 계산 데이터 초기화
  sel3_keyWordList.forEach((k) => {
    sel3_calData.push([k[0], "X", 0, []]) // 키워드 리스트 초기화
  });

  for (let i = 0; i < Excel_data.length; i++) {
    for (let j = 0; j < sel3_keyWordList.length; j++) {
      let keyWord = sel3_keyWordList[j][0]; // 키워드
      let okTime = sel3_keyWordList[j][1]; // 인정시간
      if (keyWord.indexOf(",") == -1) { // 키워드에 콤마가 없을 경우
        if (keyWord.indexOf("?") == -1) sel3_data_calc(keyWord, okTime, Excel_data[i]);
        else keyWord.replaceAll(" ", "").split("?").forEach(value => { sel3_data_calc(value, okTime, Excel_data[i]); });
      } else { // 키워드에 콤마가 있을 경우
        keyWord.replaceAll(" ", "").split(",").forEach(splitKeyWord => {
          if (splitKeyWord.indexOf("?") == -1) sel3_data_calc(splitKeyWord, okTime, Excel_data[i]);
          else splitKeyWord.replaceAll(" ", "").split("?").forEach(value => { sel3_data_calc(value, okTime, Excel_data[i]); });
        });
      }
    }
  }
  sel3_view(); // 결과를 화면에 출력
}

/**
* 데이터를 계산하여 최종 데이터에 추가하는 함수
* @param {string} searchKeyWord - 찾고자 하는 키워드
* @param {string} okTime - 인정시간
* @param {Object} data - 넘어온 데이터
*/
function sel3_data_calc(searchKeyWord, okTime, data) {
  let okM = 0;
  let titleName = "제목";
  if (!data[titleName]) titleName = "교육과정명";

  if (data[titleName].indexOf(searchKeyWord) != -1) {
    okM = (data["실적시간"] + "").indexOf(":") != -1 ? Number(isEmpty((data["실적시간"] + "").split(":")[1])) + (Number(isEmpty((data["실적시간"] + "").split(":")[0])) * 60) : Number(isEmpty(data["실적시간"])) + (Number(isEmpty(data["실적시간"])) * 60);

    for (let i = 0; i < sel3_calData.length; i++) {
      for (let j = 0; j < sel3_calData[i][3].length; j++) {
        if (sel3_calData[i][3][j]["__rowNum__"] == data["__rowNum__"] && sel3_calData[i][0].indexOf(searchKeyWord) != -1) return;
      }

      if (sel3_calData[i][0].indexOf(searchKeyWord) != -1) {
        okM += Number(sel3_calData[i][2]);
        sel3_calData[i][2] = okM;
        if (okTime.indexOf(".") == -1) {
          if (sel3_calData[i][2] < okTime && sel3_calData[i][2] > 0) sel3_calData[i][1] = "▲";
          else if (sel3_calData[i][2] >= okTime) sel3_calData[i][1] = "O";
        } else {
          let imsiArr = okTime.replaceAll(" ", "").split(".");
          if (sel3_calData[i][2] < imsiArr[0] && sel3_calData[i][2] > 0 && sel3_calData[i][1] != "O") sel3_calData[i][1] = "▲";
          else if (sel3_calData[i][2] >= imsiArr[0]) sel3_calData[i][1] = "O";
          if (imsiArr[1] == okM) sel3_calData[i][1] = "O";
        }
        sel3_calData[i][3].push(data);
      }
    }
  }
}

/**
* 계산된 데이터를 화면에 출력하는 함수
*/
function sel3_view() {
  let fullTime = 0;
  let str = "<hr>";
  for (let i = 0; i < sel3_calData.length; i++) {
    str += `<h3>${sel3_keyWordList[i][0]} ${sel3_calData[i][1]} (${sel3_calData[i][2]} / ${sel3_keyWordList[i][1]})</h3>`;
    fullTime += Number(sel3_calData[i][2]);
    for (let j = 0; j < sel3_calData[i][3].length; j++) {
      str += `${sel3_calData[i][3][j]["교육과정명"]}(${sel3_calData[i][3][j]["실적시간"]})<br>`;
    }
    str += "<hr>";
  }
  let excelFullTime = 0;
  for(let data of sel3_Excel_data) excelFullTime += (data["실적시간"] + "").indexOf(":") != -1 ? Number(isEmpty((data["실적시간"] + "").split(":")[1])) + (Number(isEmpty((data["실적시간"] + "").split(":")[0])) * 60) : Number(isEmpty(data["실적시간"])) + (Number(isEmpty(data["실적시간"])) * 60);
  $("#sel3_demo").html(`엑셀내의 모든 교육 합산시간 (${Math.floor(excelFullTime/60)}시간 ${excelFullTime%60}분)<br>필수항목 총 학습시간 (${Math.floor(fullTime/60)}시간 ${fullTime%60}분) ${str}`);
}
