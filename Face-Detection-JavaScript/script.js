function showSection(sectionId) {
  // Hide all sections
  const sections = document.querySelectorAll('.section');
  sections.forEach((section) => {
    section.classList.remove('active');
  });

  // Remove 'active' class from all sidebar links
  const links = document.querySelectorAll('.sidebar a');
  links.forEach((link) => {
    link.classList.remove('active');
  });

  // Show the selected section
  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.classList.add('active');
  }

  // Set the active link
  const activeLink = document.getElementById(sectionId + '-link');
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Get references to form elements
  const complaintForm = document.getElementById('complaint-form');
  const complaintType = document.getElementById('complain-type');
  const complaintDetails = document.getElementById('complain-details');
  const recentComplaintsList = document.getElementById('recent-complaints');

  // Handle form submission
  complaintForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission

    // Get the current date
    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    // Create new complaint item
    const complaintItem = document.createElement('li');
    complaintItem.innerHTML = `<strong>${complaintType.options[complaintType.selectedIndex].text}:</strong> ${complaintDetails.value} - Not yet resolved (Submitted: ${currentDate})`;

    // Append to the recent complaints list
    recentComplaintsList.appendChild(complaintItem);

    // Clear form inputs after submission
    complaintType.value = '';
    complaintDetails.value = '';
  });
});
