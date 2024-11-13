// Sidebar toggle
function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
  }
  
  // Show selected section
  function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      section.style.display = section.id === sectionId ? 'block' : 'none';
    });
    toggleSidebar(); // Close sidebar after selecting
  }
  
  // Simulate complaint submission
  function submitComplaint() {
    alert("Complaint submitted.");
  }
  
  // Simulate request submission
  function submitRequest() {
    alert("Request submitted.");
  }
  