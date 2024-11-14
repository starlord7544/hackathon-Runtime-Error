// Admin Login functionality
function login() {
    const password = document.getElementById('admin-password').value;
  
    // Check if the entered password matches the expected admin password
    if (password === 'admin123') {
      // Set login status in localStorage
      localStorage.setItem('isAdminLoggedIn', 'true');
      
      // Hide login section and show the dashboard
      
      
      // Call function to load API data
      loadData();
    } else {
      alert('Incorrect password!');
    }
  }
  
  // Check if the admin is logged in
  window.onload = function() {
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn');
    
    if (isAdminLoggedIn === 'true') {
      // If logged in, show the dashboard
      document.getElementById('login-container').style.display = 'none';
      document.getElementById('main-container').style.display = 'flex';
  
      // Load the API data
      loadData();
    } else {
      // If not logged in, show the login form
      document.getElementById('login-container').style.display = 'block';
      document.getElementById('main-container').style.display = 'none';
    }
  };
  
  
  // Fetch data from API and populate the divs
  async function loadData() {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts'); // Example API
      const data = await response.json();
  
      // Populating divs with data
      document.getElementById('data1').innerText = data[0].title;  // First post title
      document.getElementById('data2').innerText = data[1].title;  // Second post title
      document.getElementById('data3').innerText = data[2].title;  // Third post title
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  