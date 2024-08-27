let sel2_Excel_data = [];
let sel2_filterList = ["garaData"];
let sel2_calData = [];
let sel2_searchLevel = 8;

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

function sel2_run(Excel_data, type = null) {
  if (type == "init") sel2_calData = [];
  else if(type == "input") {
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
      // searchKeyWordFront = keyWord.substr(0, keyWord.length > 5 ? 6 : keyWord.length);
      // searchKeyWordBack = keyWord.substr(keyWord.length > 8 ? keyWord.length - 9 : 0, keyWord.length);

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

function sel2_view() {
  let str = "";
  let searchCnt = 1;
  for (let data of sel2_calData) {
    let okM1 = (Number(isEmpty(data[0].인정시간)) * 60) + (Number(isEmpty(data[0].인정시간분)));
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

function sel2_searchLevelCal(searchLevel) {
  sel2_searchLevel = Number(searchLevel);
  sel2_run(null, 'init');
}

function sel2_reg(str) {
  str = str.trim();

  str = str.replace(/^\[.*?\]/, '');
  str = str.replace(/^\(.*?\)/, '');
  str = str.replace(/^\d{2,4}/, '');
  str = str.replace(/^년도/, '');
  str = str.replace(/^년/, '');

  return str;
}

function sel2_nameSearch(name) {
  let returnArr = [];
  for (let i = 0; i < sel2_Excel_data.length; i++) {
    for (let key in sel2_Excel_data[i]) if (key == "성명" && sel2_Excel_data[i][key] == name) returnArr.push(sel2_Excel_data[i]);
  }
  return returnArr;
}