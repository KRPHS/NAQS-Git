let sel1_Excel_data = [];
let sel1_calData = new Map();
let sel1_nameList = [];
let sel1_keyWordList = data_KeyWord;

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
    // console.log(sel1_keyWordList);
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
    // console.log(sel1_nameList);
  }
}

// sel1_calData[이름][키워드 [키워드명, "O,X", 수강시간, 수강내용배열]]
function sel1_run(Excel_data) {
  sel1_keyWordList = data_KeyWord;
  sel1_Excel_data = Excel_data;
  // console.log(sel1_keyWordList);
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
      sel1_keyWordList.forEach((okTime, keyWord) => {
        keyWord = keyWord.replaceAll(" ", "");
        if (keyWord.indexOf(",") == -1) {
          if (keyWord.indexOf("?") == -1) sel1_data_calc(keyWord, okTime, searchList[i]);
          else keyWord.split("?").forEach(value => { sel1_data_calc(value, okTime, searchList[i]) });
        } else {
          // keyWord.split(",").forEach(splitKeyWord => {
          if (keyWord.indexOf("?") == -1) sel1_data_calc(keyWord, okTime, searchList[i], "and");
          // else splitKeyWord.split("?").forEach(value => {sel1_data_calc(value, okTime, searchList[i], "and"+keyWord.split(",").length)});
          // });
        }
      });
    }
  }
  sel1_view();
}

function sel1_nameSearch(name) {
  let returnArr = [];
  for (let i = 0; i < sel1_Excel_data.length; i++) {
    for (let key in sel1_Excel_data[i]) if (key == "성명" && sel1_Excel_data[i][key] == name) returnArr.push(sel1_Excel_data[i]);
  }
  return returnArr;
}

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

// 최종데이터에 추가해줌
function sel1_data_calc(searchKeyWordIn, okTime, data, type = null) {
  let andcnt = 0;
  let searchKeyWord = [];
  searchKeyWord[0] = searchKeyWordIn;
  if (type == "and") {
    andcnt = searchKeyWordIn.split(",").length;
    searchKeyWord = searchKeyWordIn.split(",");
    console.log(`andcnt: ${andcnt}, type: ${type} keyword: ${searchKeyWord}`);
  }
  //찾고자하는 키워드, 인정시간, 넘어온 데이터
  let okM = 0;
  if (type != "and") {
    searchKeyWord = searchKeyWord[0];
    if (data.제목.indexOf(searchKeyWord) != -1) {
      okM = (data.인정시간 + "").indexOf(":") != -1 ? Number(isEmpty((data.인정시간 + "").split(":")[1])) + (Number(isEmpty((data.인정시간 + "").split(":")[0])) * 60) : Number(isEmpty(data.인정시간분)) + (Number(isEmpty(data.인정시간)) * 60);
  
      for (let i = 0; i < sel1_calData.get(data.성명).length; i++) {
        // 같은 키워드 내에 같은 데이터 들어가는거 방지
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
  } else {
    if (data.제목.indexOf(searchKeyWord[0]) != -1 && data.제목.indexOf(searchKeyWord[1]) != -1) {
      okM = (data.인정시간 + "").indexOf(":") != -1 ? Number(isEmpty((data.인정시간 + "").split(":")[1])) + (Number(isEmpty((data.인정시간 + "").split(":")[0])) * 60) : Number(isEmpty(data.인정시간분)) + (Number(isEmpty(data.인정시간)) * 60);

      for (let i = 0; i < sel1_calData.get(data.성명).length; i++) {
        // 같은 키워드 내에 같은 데이터 들어가는거 방지
        for (let j = 0; j < sel1_calData.get(data.성명)[i][3].length; j++) {
          if (sel1_calData.get(data.성명)[i][3][j][""] == data[""] && sel1_calData.get(data.성명)[i][0].indexOf(searchKeyWord) != -1) return;
        }
        if (sel1_calData.get(data.성명)[i][0].indexOf(searchKeyWord[0]) != -1 && sel1_calData.get(data.성명)[i][0].indexOf(searchKeyWord[1]) != -1) {
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
          console.log("andFilter");
          sel1_calData.get(data.성명)[i][3].push(data);
        }
      }
    }
  }
}

//데이터 출력부분
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

function sel1_modalView(name, keyWord, type) {
  let str = "";
  // single, multi
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
      // console.log(data);
    }
  }
  $("#modal_view_title").html(`${name} (${Math.floor(fullTime / 60)}시간 ${fullTime % 60}분)`);
  $("#modal_view_content").html(str);
  $('#modal').css('display', 'block');
}

function modal_close() {
  $('#modal').css('display', 'none');
}

// 널 체크체크
function isEmpty(str) {
  if (typeof str == undefined || str == null || str == "") return 0;
  else return str;
}

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