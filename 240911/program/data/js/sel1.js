/**
 * 테스트 함수
 */
function test() {
  console.log(`sel1_price_header: ${sel1_price_header}`);
  console.log(`sel1_price: ${sel1_price}`);
}

// 공용차량 대장 데이터
let sel1_data1 = [];

// 상시 출장 데이터
let sel1_data3 = [];

// 거리 계산 관련 데이터
let sel1_price_header = [];
let sel1_price = [];

// 저장된 위치 데이터를 설정
if (data_save_location != "null") {
  $("#sel1_select_location").val(data_save_location);
  let imsiData = { value: data_save_location };
  sel1_select_location(imsiData);
}

/**
* 엑셀 파일을 읽어와서 처리하는 함수
* @param {string} type - 엑셀 파일 타입
* @param {object} obj - 엑셀 파일 입력 객체
*/
function readExcel(type, obj) {
  let input = event.target;
  let reader = new FileReader();
  reader.onload = function () {
    let data = reader.result;
    let workBook = XLSX.read(data, { type: 'binary' });

    workBook.SheetNames.forEach(function (sheetName) {
      let rows = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);
      if (type == 'sel1') {
        readExcelsel1(rows, obj);
      }
    });
  };
  reader.readAsBinaryString(input.files[0]);
}

/**
* 사무소 선택 데이터를 화면에 표시하는 함수
*/
function sel1_viewLocation() {
  let demo = $("#sel1_demo");

  if (!data_location_km) return alert("데이터가 존재하지 않습니다.");
  let str = "<select id='sel1_select_location' onchange='sel1_select_location(this)'>";

  for (let key in data_location_km) {
    str += `<option ${data_save_location == key ? 'selected' : ''}>${key}</option>`;
  }
  str += `</select>`;
  demo.html(str);

  let imsi = { "value": data_save_location };
  sel1_select_location(imsi);
}
sel1_viewLocation();

/**
* 선택된 사무소 데이터를 설정하고 화면에 표시하는 함수
* @param {object} obj - 선택된 객체
*/
function sel1_select_location(obj) {
  data_save_location = obj.value;
  saveData("kmLocation", data_save_location);

  if (obj.value == "") {
    $("#sel1_km_input").attr("disabled", false);
    return alert("새로고침후 다시 이용해주세요.");
  }

  if (data_location_km[obj.value]["분소"] != undefined) $("#sel1_bunso").slideDown(500);
  else {
    $("#sel1_bunso").slideUp(500);
    $("#sel1_bunsoList").val("");
  }

  sel1_price_header = [];
  let list = data_location_km[obj.value].header;
  for (let i = 0; i < list.length; i++) sel1_price_header.push([list[i], i]);
  sel1_price = data_location_km[obj.value].km;

  $("#sel1_km_input").attr("disabled", false);
}

/**
* 엑셀 파일 데이터를 처리하는 함수
* @param {Array} excelData - 엑셀 데이터 배열
* @param {object} obj - 엑셀 파일 입력 객체
*/
function readExcelsel1(excelData, obj) {
  if (obj.id == "sel1_filename1") {
    if (sel1_price_header.length < 2) {
      $("#" + obj.id).val("");
      $("#" + obj.id).siblings('.upload-name').val("파일선택");
      return alert("사무소 선택을 먼저해주세요.");
    }
    for (let i = 0; i < excelData.length; i++) {
      if (excelData[i]["탑승자"] == null) excelData[i]["탑승자"] = "X";
    }
    sel1_data1 = excelData;
  } else if (obj.id == "sel1_filename2") {
    if (sel1_data1.length < 3) {
      $("#" + obj.id).val("");
      $("#" + obj.id).siblings('.upload-name').val("파일선택");
      return alert("반납 운행일지 파일을 먼저 올려주세요");
    }
    for (let i = 0; i < excelData.length; i++) {
      excelData[i]["예산과목"] = "";
      excelData[i]["여비확인"] = "";
      excelData[i]["대장작성여부"] = "";
      let sel1_header_check = 0;
      let header_check_imsiArr = excelData[i]["출장지"].replaceAll(" ", "").split(",");

      if (data_location_km[document.getElementById("sel1_select_location").value]["분소"] != undefined && excelData[i]["공용차량여부"] == "이용차량없음") {
        let bunsoNameList = $("#sel1_bunsoList").val().replaceAll(" ", "").split(",");
        for (let name = 0; name < bunsoNameList.length; name++) {
          if (excelData[i]["출장자"].indexOf(bunsoNameList[name]) != -1) {
            excelData[i]["출장자"] += "(분소직원)";
          }
        }
      }
      if (excelData[i]["출장자"].indexOf("분소") != -1) {
        sel1_price_header = [];
        let list = data_location_km[document.getElementById("sel1_select_location").value]["분소"].header;
        for (let i = 0; i < list.length; i++) {
          sel1_price_header.push([list[i], i]);
        }
        sel1_price = data_location_km[document.getElementById("sel1_select_location").value]["분소"].km;
      } else {
        sel1_select_location(document.getElementById("sel1_select_location"));
      }

      for (let j = 0; j < sel1_price_header.length; j++) {
        for (let a = 0; a < header_check_imsiArr.length; a++) {
          let header = sel1_price_header[j][0].replaceAll(" ", "").split(",");
          for (let z = 0; z < header.length; z++) {
            if (header[z].indexOf("*") != -1) {
              let headerReg = header[z].replaceAll("*", "");
              if (header_check_imsiArr[a].substr(header_check_imsiArr[a] - headerReg.length, header_check_imsiArr[a].length).indexOf(headerReg) != -1) header_check_imsiArr[a] = sel1_price_header[1][0];
            }
          }
          if (header_check_imsiArr[a] == "") header_check_imsiArr.splice(a, 1);
          if (sel1_price_header[j][0].indexOf(header_check_imsiArr[a]) != -1) sel1_header_check++;
        }
      }

      let sel1_resultKm = Number(sel1_getKm(excelData[i]["출장지"], "cal"));

      if ((header_check_imsiArr.length != sel1_header_check && excelData[i]["공용차량여부"] == "이용차량없음") || sel1_resultKm == 0.0001) {
        excelData[i]["출장지"] += " 확인필요";
        sel1_resultKm = 0;
      }

      if (excelData[i]["공용차량여부"] == '이용차량없음') {
        for (let j = 0; j < sel1_data1.length; j++) {
          if (sel1_data1[j]["탑승자"].indexOf(excelData[i]["출장자"]) != -1 && sel1_data1[j]["사용일시"].substr(0, 10).replaceAll("-", "") == excelData[i]["시작일"]) {
            excelData[i]["대장작성여부"] = `확인필요 (공용차량 사용 한것 같음)`;
          } else if (excelData[i]["대장작성여부"] != `확인필요 (공용차량 사용 한것 같음)`) excelData[i]["대장작성여부"] = "";
        }
        if (excelData[i]["출장지"].indexOf("확인필요") != -1) {
          excelData[i]["여비확인"] = `출장지 확인`;
          excelData[i]["대장작성여부"] = `출장지 확인`;
        }
        else if (sel1_resultKm >= 80 && Number(excelData[i]["여비"]) == 18000) excelData[i]["여비확인"] = `O (${sel1_resultKm.toFixed(2)}Km, 18,000원)`;
        else if (sel1_resultKm >= 50 && sel1_resultKm < 80 && Number(excelData[i]["여비"]) == 15000) excelData[i]["여비확인"] = `O (${sel1_resultKm.toFixed(2)}Km, 15,000원)`;
        else if (sel1_resultKm < 50 && sel1_resultKm < 50 && sel1_resultKm > 0 && Number(excelData[i]["여비"]) == 12000) excelData[i]["여비확인"] = `O (${sel1_resultKm == 0.0002 ? "시내권" : sel1_resultKm.toFixed(2) + "Km"}, 12,000원)`;
        else if (excelData[i]["대장작성여부"] == `확인필요 (공용차량 사용 한것 같음)`) excelData[i]["여비확인"] = `확인필요 (공용차량 사용 한것 같음)`;
        else excelData[i]["여비확인"] = `X (${sel1_resultKm.toFixed(2)}Km, ${sel1_resultKm >= 80 ? "18,000원" : sel1_resultKm >= 50 ? "15,000원" : sel1_resultKm < 50 ? "12,000원" : sel1_resultKm == 0 ? "확인필요 (공용차량 사용 한것 같음)" : "오류"})`;
      } else if (excelData[i]["공용차량여부"] == '공용차량') {
        sel1_resultKm = 0;

        if (excelData[i]["출장자"].indexOf("/") != -1) {
          excelData[i]["대장작성여부"] = "";
          let imsiName = excelData[i]["출장자"].replaceAll(" ", "").split("/");
          let str = "";
          for (let iName = 0; iName < imsiName.length; iName++) {
            str = "X";
            for (let j = 0; j < sel1_data1.length; j++) {
              if (sel1_data1[j]["탑승자"].indexOf(imsiName[iName]) != -1 && sel1_data1[j]["사용일시"].substr(0, 10).replaceAll("-", "") == excelData[i]["시작일"]) {
                sel1_resultKm = Number(sel1_data1[j]["운행거리"]);
                str = "O";
              }
            }
            if (str == "O") excelData[i]["대장작성여부"] += "O / ";
            else if (str == "X") excelData[i]["대장작성여부"] += "X 작성 안함 / ";
          }
          excelData[i]["대장작성여부"] = excelData[i]["대장작성여부"].substr(0, excelData[i]["대장작성여부"].length - 3);
        } else if (excelData[i]["출장자"].indexOf("/") == -1) {
          for (let j = 0; j < sel1_data1.length; j++) {
            if (sel1_data1[j]["탑승자"].indexOf(excelData[i]["출장자"]) != -1 && sel1_data1[j]["사용일시"].substr(0, 10).replaceAll("-", "") == excelData[i]["시작일"]) {
              sel1_resultKm = Number(sel1_data1[j]["운행거리"]);
              excelData[i]["대장작성여부"] = `O`;
            } else if (excelData[i]["대장작성여부"] != `O`) excelData[i]["대장작성여부"] = "X 작성 안함";
          }
        }
        if (sel1_resultKm >= 80 && Number(excelData[i]["여비"]) == 9000) excelData[i]["여비확인"] = `O (${sel1_resultKm}Km, 9,000원)`;
        else if (sel1_resultKm >= 50 && sel1_resultKm < 80 && Number(excelData[i]["여비"]) == 7500) excelData[i]["여비확인"] = `O (${sel1_resultKm}Km, 7,500원)`;
        else if (sel1_resultKm < 50 && sel1_resultKm < 50 && sel1_resultKm > 0 && Number(excelData[i]["여비"]) == 6000) excelData[i]["여비확인"] = `O (${sel1_resultKm}Km, 6,000원)`;
        else if (sel1_resultKm == 0 && excelData[i]["대장작성여부"] == "X 작성 안함") excelData[i]["여비확인"] = `X 작성 안함`;
        else excelData[i]["여비확인"] = `X (${sel1_resultKm}Km, ${sel1_resultKm >= 80 ? "9,000원" : sel1_resultKm >= 50 ? "7,500원" : sel1_resultKm < 50 ? "6,000원" : sel1_resultKm == 0 ? "X 작성 안함" : "오류"})`;
      }
    }

    sel1_data3 = excelData;
    let str = "<table><tr>";
    for (let key in excelData[0]) {
      str += "<td>" + key + "</td>";
    }
    str += "</tr><tr>"
    for (let i = 0; i < excelData.length; i++) {
      for (let key in excelData[i]) {
        let imData = excelData[i][key].toString();
        if (imData == "출장지 확인") {
          str += "<td style='background-color: red;color: white;border: 1px solid black;'>" + excelData[i][key] + "</td>";
        } else if (imData.indexOf("X") != -1) {
          str += "<td style='background-color: yellow;border: 1px solid black;'>" + excelData[i][key] + "</td>";
        } else if (imData.indexOf("확인필요") != -1) {
          str += "<td style='background-color: blue;color: white;border: 1px solid black;'>" + excelData[i][key] + "</td>";
        } else {
          str += "<td style='border-top: 1px solid black;'>" + excelData[i][key] + "</td>";
        }
      }
      str += "</tr>";
    }
    str += "</table>";
    $("#demo").html(str);
    tableToExcel_sel1('상시출장');
  } else alert("알수 없습니다. id: " + obj.id);
}

/**
* 테이블 데이터를 엑셀 파일로 다운로드하는 함수
* @param {string} name - 파일 이름
*/
function tableToExcel_sel1(name) {
  let data_type = 'data:application/vnd.ms-excel;charset=utf-8';
  let table_html = encodeURIComponent(document.getElementById("demo").outerHTML);
  let time = new Date;
  let as = document.createElement('a');
  a.href = data_type + ',%EF%BB%BF' + table_html;
  a.download = name + time.getFullYear() + (time.getMonth() + 1) + time.getDay() + time.getHours() + time.getMinutes() + time.getSeconds() + '.xls';
  a.click();
}

/**
* 입력된 위치 데이터를 이용해 거리를 계산하는 함수
* @param {object} obj - 입력된 객체
*/
function sel1_km_cal(obj) {
  if (document.getElementById("sel1_select_location").value == "") return alert("사무소를 먼저 선택해주세요 !_!");
  let str = `${sel1_price_header[0][0]} => ${obj.value.replaceAll(" ", "").replaceAll(",", " => ")} => ${sel1_price_header[0][0]}<br>총합 <b>${sel1_getKm(obj.value, "cal").toFixed(2)}Km</b><br>`;

  let objValue = obj.value.replaceAll(" ", "").split(",");
  if (objValue[0] != sel1_price_header[0][0]) objValue.unshift(sel1_price_header[0][0]);
  if (objValue[objValue.length - 1] != sel1_price_header[0][0]) objValue.push(sel1_price_header[0][0]);

  for (let i = 0; i < objValue.length; i++) if (objValue.length - 1 > j) str += `<br>${objValue[j]} => ${objValue[i + 1]} <b>${sel1_getKm(objValue[i] + "," + objValue[i + 1], "search")}Km</b>`;

  $("#sel1_km_cal_demo").html(str);
}

/**
* 입력된 위치 문자열을 이용해 거리를 반환하는 함수
* @param {string} str - 위치 문자열
* @param {string} type - 계산 타입 (cal 또는 search)
* @returns {number} 계산된 거리
*/
function sel1_getKm(str, type) {
  if (str.indexOf(".") != -1) return 0.0001;
  let resPrice = 0;
  if (str == "" || str == null) return 0;
  let imsiArr = str.replaceAll(" ", "").split(",");
  if (imsiArr.length == 0) return 0;

  for (let j = 0; j < sel1_price_header.length; j++) {
    for (let a = 0; a < imsiArr.length; a++) {
      let header = sel1_price_header[j][0].replaceAll(" ", "").split(",");
      for (let z = 0; z < header.length; z++) {
        if (header[z].indexOf("*") != -1) {
          let headerReg = header[z].replaceAll("*", "");
          if (imsiArr[a].substr(imsiArr[a] - headerReg.length, imsiArr[a].length).indexOf(headerReg) != -1) imsiArr[a] = sel1_price_header[1][0];
        }
      }
    }
  }

  if (imsiArr[0] != sel1_price_header[0][0] && type == "cal") imsiArr.unshift(sel1_price_header[0][0]);
  if (imsiArr[imsiArr.length - 1] != sel1_price_header[0][0] && type == "cal") imsiArr.push(sel1_price_header[0][0]);

  for (let j = 0; j < imsiArr.length; j++) {
    let sel1_imsi_num1 = 100;
    let sel1_imsi_num2 = 100;
    for (let i = 0; i < sel1_price_header.length; i++) {
      if (j + 1 < imsiArr.length) {
        if (sel1_price_header[i][0].indexOf(imsiArr[j]) != -1 && sel1_imsi_num1 == 100) sel1_imsi_num1 = sel1_price_header[i][1];
        if (sel1_price_header[i][0].indexOf(imsiArr[j + 1]) != -1 && sel1_imsi_num2 == 100) sel1_imsi_num2 = sel1_price_header[i][1];
      }
    }
    if (sel1_imsi_num1 != 100 && sel1_imsi_num2 != 100) resPrice += Number(sel1_price[sel1_imsi_num1][sel1_imsi_num2]);
    if (imsiArr.length == 1 && imsiArr[j] == sel1_price_header[0][0]) resPrice = sel1_price[0][1] * 2;
  }

  return resPrice;
}
