const nameInput = document.getElementById("name")
const passInput = document.getElementById("password")
const loginBtn = document.getElementById("loginBtn")

let nameValue = nameInput.value
let passValue = passInput.value

nameInput.addEventListener("input", (e) => {
    nameValue = e.target.value
    console.log(nameValue)
})
passInput.addEventListener("input", (e) => {
    passValue = e.target.value
    console.log(passValue)
})

loginBtn.addEventListener("click", (e) => {
    e.preventDefault()
    if (nameValue !== "admin" || passValue !== "admin123")
        window.alert("Invalid Credentials")
    else
        window.location.href = "./adminDashboard.html"
})
