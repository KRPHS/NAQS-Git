function check(obj) {
  // let 변수명 = 값;
  let data = getData(obj);
  data = deleteColumn(obj, "업종명");
  data = addColumn(obj, "추가");
  // data = keyWordFilter(data, "업소명", "칼국수,얼큰");
  // data = keyWordORFilter(data, "업태명", "한식,중국식");
  data = numberFilter(data, "식당번호", ">", 50000);
  data = keyWordFilter(data, "업소명", "칼국수");

  arrayToTableView("demo", getHeader(obj), data);
  // tableToExcel("demo", "파일이름");
}

function inputData() {
  
}