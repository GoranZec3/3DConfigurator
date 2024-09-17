// script.js
import assets from './assets.js';
$(document).ready(function() {
    // Ensure this script only runs on the index.html page
    if ($('#load-chair-1').length && $('#load-chair-2').length) {
        $('#load-chair-1').on('click', function() {
            console.log('Chair 1 button clicked');
            // Store the chair data in localStorage
            localStorage.setItem('selectedChair', JSON.stringify(assets[0]));
            window.location.href = 'chair.html';
        });

        $('#load-chair-2').on('click', function() {
            console.log('Chair 2 button clicked');
            // Store the chair data in localStorage
            localStorage.setItem('selectedChair', JSON.stringify(assets[1]));
            window.location.href = 'chair.html';
        });
    }
});
