

let timeout = null;
function search(e){
  clearTimeout(timeout)
  timeout = setTimeout(function() {
    let searchString = document.querySelector('input[type="search"]').value;
    if(searchString == '' || e == '*') { searchString = '*'; }

    fetch('/search/' + searchString)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
    console.log(data)
      let results = document.getElementById('results');

      let table = `<table class="table">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Label</th>
          </tr>
        </thead>
        <tbody>`;

      data.forEach(function(item, key) {
        table += `<tr onclick="window.location.href='/disease/${item.id}'">
          <th scope="row">${item.id}</th>
          <td>${item.label}</td>
        </tr>`;
      });

      table += `</tbody>
      </table>`;

      results.innerHTML = table;
    });
  }, 500);

  return false;
}

$(function() {
  if(document.querySelector('input[type="search"]')) {
    document.querySelector('input[type="search"]').value = '';
  }

  search('*');
});  
