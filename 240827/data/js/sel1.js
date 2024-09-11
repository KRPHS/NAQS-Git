let sel1_Excel_data = [];
let sel1_calData = new Map();
let sel1_nameList = [];
let sel1_keyWordList = data_KeyWord;
let sel1_keyWordCnt = [];

/**
 * 주어진 텍스트 파일을 읽어와서 키워드 또는 이름 리스트를 업데이트합니다.
 * 파일 타입에 따라 키워드 또는 이름을 처리하고, 이를 DOM에 표시합니다.
 * @param {File} file - 읽을 텍스트 파일
 * @param {string} type - 처리할 데이터 유형 ("keyword" 또는 "name")
 * @returns {Promise<void>}
 */
async function sel1_readTxt(file, type) {
  let returnStr = "";
  let text = await file.text();
  if (type == "keyword") {
    // 키워드 처리 (코드가 주석 처리되어 있어 실행되지 않음)
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
 * 엑셀 데이터를 바탕으로 이름과 키워드를 매핑하고, 키워드 조건에 따라 데이터를 분석합니다.
 * 분석된 데이터를 화면에 표시하기 위해 sel1_view 함수를 호출합니다.
 * @param {Array} Excel_data - 분석할 엑셀 데이터 배열
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
  sel1_keyWordList.forEach((_, key) => {
    sel1_keyWordCnt.push([key, []]);
  });

  // 이름 리스트를 순회하며 데이터 분석 실행
  for (let name of sel1_nameList) {
    let searchList = sel1_nameSearch(name);
    for (let i = 0; i < searchList.length; i++) {
      sel1_keyWordList.forEach((okTime, keyWord) => {
        keyWord = keyWord.replaceAll(" ", "");
        if (keyWord.indexOf(",") == -1) {
          if (keyWord.indexOf("?") == -1) sel1_data_calc(keyWord, okTime, searchList[i]);
          else keyWord.split("?").forEach(value => { sel1_data_calc(value, okTime, searchList[i]) });
        } else {
          if (keyWord.indexOf("?") == -1) sel1_data_calc(keyWord, okTime, searchList[i], "and");
        }
      });
    }
  }
  sel1_view();
}

/**
 * 주어진 이름과 일치하는 엑셀 데이터 항목을 검색하여 반환합니다.
 * @param {string} name - 검색할 이름
 * @returns {Array} - 해당 이름과 일치하는 데이터 항목 배열
 */
function sel1_nameSearch(name) {
  let returnArr = [];
  for (let i = 0; i < sel1_Excel_data.length; i++) {
    for (let key in sel1_Excel_data[i]) if (key == "성명" && sel1_Excel_data[i][key] == name) returnArr.push(sel1_Excel_data[i]);
  }
  return returnArr;
}

/**
 * 특정 이름과 키워드를 기반으로 엑셀 데이터를 검색하여 반환합니다.
 * @param {string} name - 검색할 이름
 * @param {string} keyWord - 검색할 키워드
 * @returns {Array} - 해당 이름과 키워드가 포함된 데이터 항목 배열
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
 * 주어진 키워드, 인정 시간, 데이터 항목을 기반으로 sel1_calData에 데이터를 계산하여 추가합니다.
 * @param {string} searchKeyWordIn - 검색할 키워드 문자열
 * @param {string} okTime - 해당 키워드에 대한 인정 시간
 * @param {Object} data - 엑셀 데이터 항목
 * @param {string} [type=null] - 키워드 처리 유형 ("and" 또는 기본값)
 */
function sel1_data_calc(searchKeyWordIn, okTime, data, type = null) {
  let andcnt = 0;
  let searchKeyWord = []; // 배열로 초기화
  searchKeyWord[0] = searchKeyWordIn;
  
  if (type === "and") {
    andcnt = searchKeyWordIn.split(",").length;
    searchKeyWord = searchKeyWordIn.split(",");
    console.log(`andcnt: ${andcnt}, type: ${type} keyword: ${searchKeyWord}`);
  }
  
  let okM = 0;
  if (type !== "and") {
    searchKeyWord = searchKeyWord[0];
    if (data.제목.indexOf(searchKeyWord) !== -1) {
      okM = (data.인정시간 + "").indexOf(":") !== -1
        ? Number(isEmpty((data.인정시간 + "").split(":")[1])) + (Number(isEmpty((data.인정시간 + "").split(":")[0])) * 60)
        : Number(isEmpty(data.인정시간분)) + (Number(isEmpty(data.인정시간)) * 60);

      for (let i = 0; i < sel1_calData.get(data.성명).length; i++) {
        for (let j = 0; j < sel1_calData.get(data.성명)[i][3].length; j++) {
          if (sel1_calData.get(data.성명)[i][3][j][""] === data[""] && sel1_calData.get(data.성명)[i][0].indexOf(searchKeyWord) !== -1) return;
        }
        if (sel1_calData.get(data.성명)[i][0].indexOf(searchKeyWord) !== -1) {
          okM += Number(sel1_calData.get(data.성명)[i][2]);
          sel1_calData.get(data.성명)[i][2] = okM;
          if (okTime.indexOf(".") === -1) {
            if (sel1_calData.get(data.성명)[i][2] < okTime && sel1_calData.get(data.성명)[i][2] > 0) {
              sel1_calData.get(data.성명)[i][1] = "▲";
            } else if (sel1_calData.get(data.성명)[i][2] >= okTime) {
              sel1_calData.get(data.성명)[i][1] = "O";
            }
          } else {
            let imsiArr = okTime.replaceAll(" ", "").split(".");
            if (sel1_calData.get(data.성명)[i][2] < imsiArr[0] && sel1_calData.get(data.성명)[i][2] > 0 && sel1_calData.get(data.성명)[i][1] !== "O") {
              sel1_calData.get(data.성명)[i][1] = "▲";
            } else if (sel1_calData.get(data.성명)[i][2] >= imsiArr[0]) {
              sel1_calData.get(data.성명)[i][1] = "O";
            }
            if (imsiArr[1] == okM) sel1_calData.get(data.성명)[i][1] = "O";
          }
          sel1_calData.get(data.성명)[i][3].push(data);
        }
      }
    }
  } else {
    if (data.제목.indexOf(searchKeyWord[0]) !== -1 && data.제목.indexOf(searchKeyWord[1]) !== -1) {
      okM = (data.인정시간 + "").indexOf(":") !== -1
        ? Number(isEmpty((data.인정시간 + "").split(":")[1])) + (Number(isEmpty((data.인정시간 + "").split(":")[0])) * 60)
        : Number(isEmpty(data.인정시간분)) + (Number(isEmpty(data.인정시간)) * 60);

      for (let i = 0; i < sel1_calData.get(data.성명).length; i++) {
        for (let j = 0; j < sel1_calData.get(data.성명)[i][3].length; j++) {
          if (sel1_calData.get(data.성명)[i][3][j][""] === data[""] && sel1_calData.get(data.성명)[i][0].indexOf(searchKeyWord) !== -1) return;
        }
        if (sel1_calData.get(data.성명)[i][0].indexOf(searchKeyWord[0]) !== -1 && sel1_calData.get(data.성명)[i][0].indexOf(searchKeyWord[1]) !== -1) {
          okM += Number(sel1_calData.get(data.성명)[i][2]);
          sel1_calData.get(data.성명)[i][2] = okM;
          if (okTime.indexOf(".") === -1) {
            if (sel1_calData.get(data.성명)[i][2] < okTime && sel1_calData.get(data.성명)[i][2] > 0) sel1_calData.get(data.성명)[i][1] = "▲";
            else if (sel1_calData.get(data.성명)[i][2] >= okTime) sel1_calData.get(data.성명)[i][1] = "O";
          } else {
            let imsiArr = okTime.replaceAll(" ", "").split(".");
            if (sel1_calData.get(data.성명)[i][2] < imsiArr[0] && sel1_calData.get(data.성명)[i][2] > 0 && sel1_calData.get(data.성명)[i][1] !== "O") sel1_calData.get(data.성명)[i][1] = "▲";
            else if (sel1_calData.get(data.성명)[i][2] >= imsiArr[0]) sel1_calData.get(data.성명)[i][1] = "O";
            if (imsiArr[1] == okM) sel1_calData.get(data.성명)[i][1] = "O";
          }
          console.log("andFilter");
          sel1_calData.get(data.성명)[i][3].push(data);
        }
      }
    }
  }
}


/**
 * sel1_calData에 저장된 데이터와 키워드 조건에 따라 화면에 표 형식으로 데이터를 출력합니다.
 * 또한 키워드의 수를 계산하여 추가 정보를 화면에 표시합니다.
 */
function sel1_view() {
  sel1_keyWordList = data_KeyWord;
  let str = "<table style='border: 2px solid black'><tr id='tableHeader_sel1'><td style='width:70px'></td>";
  sel1_keyWordList.forEach((_, k) => { str += `<td>${k} <input type='button' class='modalViewBtn' value=' ? ' onclick="sel1_modalView('${k}','', 'keyWord')"></td>`; })
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
  sel1_keyWordCntCal();
  let str2 = sel1_keyWordCntCalView();
  $("#sel1_demo").html(str + str2);
}

/**
 * sel1_calData를 기반으로 각 키워드의 조건에 맞는 데이터 수를 계산하여 sel1_keyWordCnt에 저장합니다.
 */
function sel1_keyWordCntCal() {
  sel1_calData.forEach(function(data,_) {
    for(let i = 0; i < data.length; i++) {
      for(let j = 0; j < data[i][3].length; j++) {
        sel1_keyWordCnt[i][1].push(data[i][3][j]);
      }
    }
  });
}

/**
 * 키워드별로 필터된 데이터의 수를 표 형식으로 반환합니다.
 * @returns {string} - HTML 테이블 형식의 문자열
 */
function sel1_keyWordCntCalView() {
  let str = `<table>`;
  for(let i = 0; i < sel1_keyWordCnt.length; i++) {
    str += `<tr><td>${sel1_keyWordCnt[i][0]}</td><td>${sel1_keyWordCnt[i][1].length}개</td></tr>`;
  }
  str += `</table>`;
  return str;
}

/**
 * 모달 창을 통해 선택한 이름과 키워드에 대한 세부 데이터를 표시합니다.
 * 키워드 또는 이름을 기준으로 데이터를 필터링하여 표시할 내용을 다르게 처리합니다.
 * @param {string} name - 필터링할 이름 또는 키워드
 * @param {string} keyWord - 검색할 키워드 (필터 타입에 따라 다름)
 * @param {string} type - 필터링 유형 ("single", "multi", "keyWord")
 */
function sel1_modalView(name, keyWord, type) {
  let str = "";
  let fullTime = 0;
  if(type == "keyWord") {
    for(let i = 0; i < sel1_keyWordCnt.length; i++) {
      if(sel1_keyWordCnt[i][0] == name) {
        for(let j = 0; j < sel1_keyWordCnt[i][1].length; j++) {
          str += `<p>${j+1}. (${sel1_keyWordCnt[i][1][j].성명}) ${sel1_keyWordCnt[i][1][j].제목}</p>`;
          fullTime++;
        }
      }
    }
    $("#modal_view_title").html(`${name} 필터된 목록 ${fullTime}개`);
  } else {
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
  }
  $("#modal_view_content").html(str);
  $('#modal').css('display', 'block');
}

/**
 * 모달 창을 닫습니다.
 */
function modal_close() {
  $('#modal').css('display', 'none');
}

/**
 * 문자열이 비어있는지 확인하고, 비어있다면 0을 반환합니다.
 * @param {string} str - 검사할 문자열
 * @returns {number|string} - 문자열이 비어있다면 0, 그렇지 않으면 원래 문자열 반환
 */
function isEmpty(str) {
  if (typeof str == undefined || str == null || str == "") return 0;
  else return str;
}

$(document).ready(function () {
  var fileTarget = $('.filebox .upload-hidden');

  fileTarget.on('change', function () {
    if (window.FileReader) {  // 최신 브라우저
      var filename = $(this)[0].files[0].name;
    }
    else {  // 구형 IE
      var filename = $(this).val().split('/').pop().split('\\').pop();  // 파일명만 추출
    }
    $(this).siblings('.upload-name').val(filename);
  });
});
