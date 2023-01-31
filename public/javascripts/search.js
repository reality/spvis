
document.addEventListener('DOMContentLoaded', function() {
      document.querySelector('input[type="search"]').value = '';
      document.getElementById("BLDPShow").checked = false;
    });  

function search(e){
    let searchString = document.querySelector('input[type="search"]').value;

    fetch('/search/' + searchString)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
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

    return false;
  }
