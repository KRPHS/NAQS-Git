/**
 * km 데이터 뷰를 가져와서 화면에 표시하는 함수
 */
function sel3_getViewKm() {
  if (!data_location_km) return alert("데이터가 존재하지 않습니다.");
  let str = "<br><select id='mmSelect' onchange='sel3_getSelectView(this.value)'>";

  // 저장된 모든 데이터의 키를 가져와서 옵션으로 추가
  for (let key in data_location_km) {
    str += `<option ${data_save_location == key ? 'selected' : ''}>${key}</option>`;
  }
  str += `<option>추가</option>`;
  str += `</select> <input type="button" value="삭제하기" onclick="sel3_delData('mm',${null})">`;
  
  sel3_getSelectView(data_save_location);
  $("#sel3_demo").html(str);
}

/**
* 선택된 km 데이터를 화면에 표시하는 함수
* @param {string} inputValue - 선택된 데이터의 키 값
*/
function sel3_getSelectView(inputValue) {
  data_save_location = inputValue;
  saveData("kmLocation", data_save_location);

  // if(data_save_location)!@#$

  if (inputValue == "추가") {
    return sel3_addModal(null, null, "mainSelect");
  }
  let mImsiStr = "<select id='mDeleteSelect' style='width:100%'>";
  let str = "<table style='border:1px solid black'>";
  str += "<tr><td>　</td>";

  
  // if(data_location_km[inputValue] == undefined) ;
  for (let i = 0; i < data_location_km[inputValue]["header"].length; i++) {
    str += `<td style='font-size: 12px'><input type='text' style='font-size: 12px' id='mt${i}' oninput="sel3_changeData('header', '${inputValue}', '본소',this.value, ${i}, 0)" value='${data_location_km[inputValue]["header"][i]}'></td>`;
    mImsiStr += `<option value="${i}">${data_location_km[inputValue]["header"][i]}</option>`;
  }
  mImsiStr += `</select>`;
  str += "</tr>";
  for (let i = 0; i < data_location_km[inputValue]["km"].length; i++) {
    str += `<tr><td style='font-size: 12px'><input type='text' id='ml${i}' oninput="sel3_changeData('header', '${inputValue}', '본소',this.value, ${i}, 0)" value='${data_location_km[inputValue]["header"][i]}'></td>`;
    for (let j = 0; j < data_location_km[inputValue]["km"][i].length; j++) {
      str += `<td><input type='text' style='font-size: 12px' id='m${i}${j}' oninput="sel3_changeData('km', '${inputValue}', '본소',this.value, ${i}, ${j})" ${i == j ? 'disabled' : ''} title='${data_location_km[inputValue]["header"][j]} > ${data_location_km[inputValue]["header"][i]}' value='${data_location_km[inputValue]["km"][i][j]}'></td>`;
    }
    str += "</tr>";
  }
  str += `<tr><td><input type="button" style="width:100%" value="추가하기" onclick="sel3_addModal('${inputValue}', 'm')"></td><td>　</td><td>${mImsiStr}</td><td><input type="button" value="삭제하기" onclick="sel3_delData('m','${inputValue}')"></td></tr>`;
  str += "</table>";

  // 분소 데이터를 처리
  if (data_location_km[inputValue]["분소"]) {
    let sImsiStr = "<select id='sDeleteSelect' style='width:100%'>";
    str += "<br><br><h3>분소</h3>";
    str += "<table style='border:1px solid black'><tr><td>　</td>";
    for (let i = 0; i < data_location_km[inputValue]["분소"]["header"].length; i++) {
      str += `<td style='font-size: 12px'><input type='text' style='font-size: 12px' id='st${i}' oninput="sel3_changeData('header', '${inputValue}', '분소',this.value, ${i}, 0)" value='${data_location_km[inputValue]["분소"]["header"][i]}'></td>`;
      sImsiStr += `<option value="${i}">${data_location_km[inputValue]["분소"]["header"][i]}</option>`;
    }
    str += "</tr>";
    for (let i = 0; i < data_location_km[inputValue]["분소"]["km"].length; i++) {
      str += `<tr><td style='font-size: 12px'><input type='text' id='sl${i}' oninput="sel3_changeData('header', '${inputValue}', '분소',this.value, ${i}, 0)" value='${data_location_km[inputValue]["분소"]["header"][i]}'></td>`;
      for (let j = 0; j < data_location_km[inputValue]["분소"]["km"][i].length; j++) {
        str += `<td><input type='text' style='font-size: 12px' id='s${i}${j}' oninput="sel3_changeData('km', '${inputValue}', '분소',this.value, ${i}, ${j})" ${i == j ? 'disabled' : ''} title='${data_location_km[inputValue]["분소"]["header"][j]} > ${data_location_km[inputValue]["분소"]["header"][i]}' value='${data_location_km[inputValue]["분소"]["km"][i][j]}'></td>`;
      }
      str += "</tr>";
    }
    str += `<tr><td><input type="button" style="width:100%" value="추가하기" onclick="sel3_addModal('${inputValue}', 's')"></td><td>　</td><td>${sImsiStr}</td><td><input type="button" value="삭제하기" onclick="sel3_delData('s','${inputValue}')"></td></tr>`;
    str += "</table>";
  }

  $("#demo").html(str);
  saveData("kmData", data_location_km);
  $("#demo2").html("let data_location_km=" + JSON.stringify(data_location_km));
  // console.log();
}

/**
* km 데이터를 변경하는 함수
* @param {string} t - 데이터 타입 (km 또는 header)
* @param {string} location - 데이터 위치
* @param {string} type - 본소 또는 분소
* @param {string} value - 변경할 값
* @param {number} i - 데이터 인덱스
* @param {number} j - km 데이터의 경우 두 번째 인덱스
*/
function sel3_changeData(t, location, type, value, i, j) {
  if (t == "km") {
    if (type == "분소") {
      data_location_km[location]["분소"][t][i][j] = value;
      data_location_km[location]["분소"][t][j][i] = value;
      $("#s" + j + "" + i).val(value);
    } else {
      data_location_km[location][t][i][j] = value;
      data_location_km[location][t][j][i] = value;
      $("#m" + j + "" + i).val(value);
    }
  } else if (t == "header") {
    if (type == "분소") {
      data_location_km[location]["분소"][t][i] = value;
      $("#sl" + i).val(value);
      $("#st" + i).val(value);
    } else {
      data_location_km[location][t][i] = value;
      $("#ml" + i).val(value);
      $("#mt" + i).val(value);
    }
  }
  saveData("kmData", data_location_km);
  $("#demo2").html("let data_location_km=" + JSON.stringify(data_location_km));
}

/**
* 데이터 추가 모달을 여는 함수
* @param {string|null} data - 데이터 키 값
* @param {string|null} type - 데이터 타입
* @param {string|null} addType - 추가 타입 (mainSelect 또는 null)
*/
function sel3_addModal(data, type, addType = null) {
  let title = "";
  let content = "";
  if (addType) {
    title = `사무소 추가 <input type="button" style="float:right; font-size: 12px" value="추가하기" onclick="sel3_addData(${null}, ${null}, ${null}, 'main')">`;
    content = `<input type="text" id="mainSelectAdd">`;
  } else {
    let lData = data_location_km[data];
    content += `<h3>추가 출장지 <input type="text" id="addHeaderName" oninput="sel3_addModalHeaderInput(this)"></h3><hr>`;
    if (type == "s") {
      for (let i = 0; i < lData["분소"]["header"].length; i++) {
        content += `${lData["분소"]["header"][i]} > <input type="text" id="add${i}" class="sel3_locationKm">Km<hr>`;
      }
    } else if (type == "m") {
      for (let i = 0; i < lData["header"].length; i++) {
        content += `<span class="inputHeaderName"></span>${lData["header"][i]}  <input type="text" id="add${i}" class="sel3_locationKm">Km<hr>`;
      }
    }
    title = `${data} 거리 추가하기 <input type="button" style="float:right; font-size: 12px" value="추가하기" onclick="sel3_addData('${data}','${type == "m" ? lData["header"].length : lData["분소"]["header"].length}', '${type}')">`;
  }
  $("#modal_view_title").html(title);
  $("#modal_view_content").html(content);
  $('#modal').css('display', 'block');
}

/**
* 모달에서 입력된 출장지명을 업데이트하는 함수
* @param {object} obj - 입력된 객체
*/
function sel3_addModalHeaderInput(obj) {
  let inputHeader = obj.value;
  $(".inputHeaderName").html(inputHeader + " => ");
}

/**
* km 데이터를 추가하는 함수
* @param {string|null} name - 데이터 키 값
* @param {number} length - 데이터 길이
* @param {string} type - 데이터 타입
* @param {string|null} addType - 추가 타입 (mainSelect 또는 null)
*/
function sel3_addData(name, length, type, addType = null) {
  if (addType) {
    let val = $("#mainSelectAdd").val();
    if (val == "") return alert("추가할 명을 입력해주세요.");
    data_location_km[val] = {
      header: [],
      km: []
    };
    sel3_getViewKm();
    modal_close();
    return;
  }

  let imsiData = [];
  for (let i = 0; i < length; i++) {
    if ($("#addHeaderName").val() == "" || $("#addHeaderName").val() == undefined || $("#addHeaderName").val() == null) return alert("출장지명을 입력해주세요.");
    if ($("#add" + i).val() == "" || $("#add" + i).val() == undefined || $("#add" + i).val() == null) return alert("빈칸이 존재합니다.");
    imsiData.push($("#add" + i).val());
  }
  imsiData.push('0');
  if (type == "s") {
    for (let i = 0; i < data_location_km[name]["분소"]["km"].length; i++) {
      data_location_km[name]["분소"]["km"][i].push($("#add" + i).val());
    }
    data_location_km[name]["분소"]["header"].push($("#addHeaderName").val());
    data_location_km[name]["분소"]["km"].push(imsiData);
  } else if (type == "m") {
    for (let i = 0; i < data_location_km[name]["km"].length; i++) {
      data_location_km[name]["km"][i].push($("#add" + i).val());
    }
    data_location_km[name]["header"].push($("#addHeaderName").val());
    data_location_km[name]["km"].push(imsiData);
  }
  sel3_getSelectView(name);
  modal_close();
  saveData("kmData", data_location_km);
}

/**
* km 데이터를 삭제하는 함수
* @param {string} type - 데이터 타입 (mm, m, 또는 s)
* @param {string|null} name - 데이터 키 값
*/
function sel3_delData(type, name) {
  if (type == "mm") {
    let selVal = $("#mmSelect").val();
    if (selVal == null || selVal == "" || selVal == undefined) return alert("삭제할 내용을 선택해주세요.");
    if(selVal == "지원") return alert("지원은 삭제할수 없습니다.");
    let check = confirm(`${selVal}를 정말 삭제하시겠습니까?`);
    if (!check) return alert("취소 됐습니다.");
    delete data_location_km[selVal];

    // console.log(data_location_km);
    
    saveData("kmData", data_location_km);
    saveData("kmLocation", "지원");
    data_save_location = "지원";

    $("#demo").html("");
    sel3_getViewKm();
    return;
  }
  let selValue = $("#" + type + "DeleteSelect").val();
  let selData = type == "m" ? data_location_km[name]["header"][selValue] : data_location_km[name]["분소"]["header"][selValue];
  if (selData == undefined) return alert("삭제할 내용을 선택해주세요.");

  let check = confirm(`${name}에 있는 출장지(${selData})를 정말 삭제하시겠습니까?`);
  if (!check) return alert("취소 됐습니다.");

  if (type == "m") {
    for (let i = 0; i < data_location_km[name]["km"].length; i++) {
      data_location_km[name]["km"][i].splice(selValue, 1);
    }
    data_location_km[name]["km"].splice(selValue, 1);
    data_location_km[name]["header"].splice(selValue, 1);
  } else if (type == "s") {
    for (let i = 0; i < data_location_km[name]["분소"]["km"].length; i++) {
      data_location_km[name]["분소"]["km"][i].splice(selValue, 1);
    }
    data_location_km[name]["분소"]["km"].splice(selValue, 1);
    data_location_km[name]["분소"]["header"].splice(selValue, 1);
  }

  saveData();
  sel3_getSelectView(name);
  saveData("kmData", data_location_km);
}

/**
* km 데이터를 초기화하는 함수
*/
function sel3_dataReset() {
  data_location_km = data_location_km_default;
  saveData("kmData", data_location_km_default);
  alert("데이터 초기화 완료");
  sel3_getViewKm();
}