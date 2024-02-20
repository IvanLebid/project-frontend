let accountsCount = 0;
let currentPageNumber = 0;
let currentCountPerPage = document.getElementById("count-per-page").value;
let pagesCount = 0;
let $tableBody = document.querySelector('.users-table-body');

$(function () {
    getUserInfo(currentPageNumber, currentCountPerPage);
    getCountAccounts();
    creatingNewAccount();
})
// Getting accounts count and pages count for adding pagination buttons
function getCountAccounts() {
    $.get("/rest/players/count", (count) => {
        accountsCount = count;
        pagesCount = Math.ceil(accountsCount/currentCountPerPage);
        addButtons(pagesCount);
    })
}
// Adding user's rows (after getting their count per page into the table) and outputting this data
function getUserInfo(currentPageNumber, currentCountPerPage) {
    currentCountPerPage = document.getElementById("count-per-page").value;
    $.get(`/rest/players?pageNumber=${currentPageNumber}&pageSize=${currentCountPerPage}`, (accounts) => {
      //  const $tableBody = document.querySelector('.users-table-body')
        $tableBody.innerHTML = '';
        accounts.forEach(account => {
            $tableBody.insertAdjacentHTML("beforeend", addTableRow(account))
        })
    })
}
// Getting user's rows (each row contains information about the current user)
function addTableRow(account) {
    return `<tr class="row" data-id="${account.id}">
      <td>${account.id}</td>
      <td>${account.name}</td>
      <td>${account.title}</td>
      <td>${account.race}</td>
      <td>${account.profession}</td>
      <td>${account.level}</td>
      <td>${new Date(account.birthday).toLocaleDateString('uk')}</td>
      <td>${account.banned}</td>
      <td><button onclick="editAccount(${account.id})" class="edit" value="0"><img src="img/edit.png" alt="edit"></button></td>
      <td><button onclick="deleteAccount(${account.id})" class="delete" value="1"><img src="img/delete.png" alt="delete"></button></td>
    </tr>`;
}
// Adding pagination buttons
function addButtons(count){
    let $paginationButtons = document.querySelector('.page-buttons');
    $paginationButtons.innerHTML = '';
    let paginationButtonsHtml = '';
     for (let i = 0; i < count ; i++) {
             paginationButtonsHtml += `<button class="page-button" value="${i}">${i + 1}</button>`;
     }
     $paginationButtons.insertAdjacentHTML('beforeend', paginationButtonsHtml);
     addButtonEventListener();
}
// Adding event listener for pagination buttons which are changing pages and changing the view of the active page button
function  addButtonEventListener(){
    const pageButtons = document.querySelectorAll('.page-button' );
    if (pageButtons[currentPageNumber]){
        pageButtons[currentPageNumber].classList.add('active-page-button');
    }

    pageButtons.forEach(button => { button.addEventListener('click', () =>{
        if (pageButtons[currentPageNumber]){
            pageButtons[currentPageNumber].classList.remove('active-page-button');
        }
        currentPageNumber = parseInt(button.value);
        pageButtons[currentPageNumber].classList.add('active-page-button');
        getUserInfo(currentPageNumber, currentCountPerPage)})
    });
}
// Changing the count of users per page and count of pagination buttons by the dropdown list
function updateByDropdownList(){
    currentPageNumber = 0;
    currentCountPerPage = document.getElementById("count-per-page").value;
    pagesCount = Math.ceil(accountsCount/currentCountPerPage);
    getUserInfo(currentPageNumber, currentCountPerPage);
    getCountAccounts();
}
// Deleting the user(id) account from the table after clicking on the delete button
function deleteAccount(id){

    $.ajax({
        url: `/rest/players/${id}`,
        type: 'DELETE',
        success:function (){
             getUserInfo(currentPageNumber, currentCountPerPage);
             getCountAccounts();
             checkIfPageIsEmpty();
        },
    })
}
async  function checkIfPageIsEmpty() {
    await new Promise(resolve => setTimeout(resolve, 100));
    const rows = document.querySelectorAll('.row');
    if (rows.length === 0) {
        console.log('is empty');
        currentPageNumber = 0; // встановлення поточної сторінки на першу
        getUserInfo(currentPageNumber, currentCountPerPage);
        getCountAccounts();
    } else {
        console.log('is not empty');
    }
}

// Changing the user(id) account after clicking on the edit button
function editAccount(id){
    const row = document.querySelector(`tr[data-id="${id}"]`)
    const level = row.cells[5].textContent;
    const birthday = row.cells[6].textContent;
    row.innerHTML = `
    <td>${id}</td>
    <td><input type="text" id="changedName" value="${row.cells[1].textContent}"></td>
    <td><input type="text" id="changedTitle" value="${row.cells[2].textContent}"></td>
    <td><select name="race" id="changedRace"   value="${row.cells[3].textContent}">
            <option value="HUMAN">HUMAN</option>
            <option value="DWARF">DWARF</option>
            <option value="ELF">ELF</option>
            <option value="GIANT">GIANT</option>
            <option value="ORC">ORC</option>
            <option value="TROLL">TROLL</option>
            <option value="HOBBIT">HOBBIT</option>
        </select></td>
    <td><select name="profession" id="changedProfession" value="${row.cells[4].textContent}">
            <option value="WARRIOR">WARRIOR</option>
            <option value="ROGUE">ROGUE</option>
            <option value="SORCERER">SORCERER</option>
            <option value="CLERIC">CLERIC</option>
            <option value="PALADIN">PALADIN</option>
            <option value="NAZGUL">NAZGUL</option>
            <option value="WARLOCK">WARLOCK</option>
            <option value="DRUID">DRUID</option>
        </select></td>
    <td>${level}</td>
    <td>${birthday}</td>
    <td> <select name="banned" id="changedBanned" value="${row.cells[7].textContent}">
            <option value="false">false</option>
            <option value="true">true</option>
        </select></td>
   <td><button onclick="saveChanges(${id})" class="save" value="2"><img src="img/save.png" alt="save"></button></td>
    `;
}
// Saving changes of the user(id) account after clicking on the save button
function saveChanges(id){
    const name = document.getElementById("changedName").value;
    const title = document.getElementById("changedTitle").value;
    const race = document.getElementById("changedRace").value;
    const profession = document.getElementById("changedProfession").value;
    const banned = document.getElementById("changedBanned").value;
    const updatedAccountsData= {
        name: name,
        title: title,
        race: race,
        profession: profession,
        banned: banned
    };
    $.ajax({
        url: `/rest/players/${id}`,
        type: "POST",
        data: JSON.stringify(updatedAccountsData),
        dataType: "json",
        contentType: "application/json",
        success: function (){
            clearInputFields();
            getUserInfo(currentPageNumber, currentCountPerPage);
            getCountAccounts();
        }
    })
}
// Adding the rules for some input fields in the block of creating the new account
function creatingNewAccount() {
    let name = document.getElementById('name')
    let title = document.getElementById('title')
    let level = document.getElementById('level');
    const minLevel=  level.min = 1;
    const maxLevel = level.max =100;
    name.addEventListener('input', function () {
        let nameValue = name.value;
        if (nameValue.length > 12){
            name.value = nameValue.slice(0, -1);
        }
    });
    title.addEventListener('input', function () {
        let titleValue = title.value;
        if (titleValue.length > 30){
            title.value = titleValue.slice(0, -1)
        }
    });
    level.min = 1;
    level.max =100;
   level.addEventListener('input', function () {
      let levelValue = parseInt(level.value);
      if (isNaN(levelValue) && levelValue < minLevel){
          level.value = 1;
      }else if (isNaN(levelValue) && levelValue > maxLevel){
          level.value = 100;
      }
   });
}
// Adding the new user account and outputting it in the table
function addingNewUser() {
    const newUserData = {
        name: $('#name').val(),
        title: $('#title').val(),
        race: $('#race').val(),
        profession: $('#profession').val(),
        level: $('#level').val(),
        birthday: new Date($('#birthday').val()).getTime(),
        banned: $('#banned').val(),
    }
    $.ajax({
        url: `/rest/players`,
        type: 'POST',
        data: JSON.stringify(newUserData),
        dataType: "json",
        contentType: "application/json",
        success: function (){
            clearInputFields();
            getUserInfo(currentPageNumber, currentCountPerPage);
            getCountAccounts();
        }
    })

}
// Clearing the input fields of creating the new account after adding the new user account
function clearInputFields() {
    document.getElementById('name').value = '';
    document.getElementById('title').value = '';
    document.getElementById('race').value = 'HUMAN';
    document.getElementById('profession').value = 'WARRIOR';
    document.getElementById('level').value = '';
    document.getElementById('birthday').value = '';
    document.getElementById('banned').value = 'false';
}
