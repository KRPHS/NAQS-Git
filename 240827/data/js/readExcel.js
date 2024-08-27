/**
* 엑셀 파일을 읽는 함수
* @param {string} type - 엑셀 파일의 타입을 지정 (sel1, sel2, sel3)
*/
function readExcel(type) {
  let input = event.target; // 파일 입력 요소
  let reader = new FileReader(); // 파일을 읽기 위한 FileReader 객체 생성

  /**
  * 파일을 읽었을 때 실행되는 함수
  */
  reader.onload = function () {
    let data = reader.result; // 읽은 파일의 데이터
    let workBook = XLSX.read(data, { type: 'binary' }); // 엑셀 데이터를 바이너리 형식으로 읽기

    // 각 시트 이름에 대해 실행
    workBook.SheetNames.forEach(function (sheetName) {
      let rows = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]); // 시트 데이터를 JSON으로 변환
      if (type == 'sel1') {
        sel1_run(rows); // sel1 타입일 경우 실행
      } else if (type == 'sel2') {
        sel2_run(rows); // sel2 타입일 경우 실행
      } else if (type == 'sel3') {
        sel3_run(rows, 'input'); // sel3 타입일 경우 실행
      }
    });
  };

  reader.readAsBinaryString(input.files[0]); // 파일을 바이너리 형식으로 읽기 시작
}
