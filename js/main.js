import * as THREE from "three";
import { initScene, animate, passModelToScene, sceneBackgroundSet} from "./scene.js";
import { animateCamera} from "./cameraAnimation.js";
import { ModelLoader} from "./model.js";
import { ARButton } from './ARButton.js';


//globals
let CAMERA;


//placeholder for changeModelColor;
let modelOnScene;

let oviniChair; 
let rendererAR;

//logic for loading asset from assets.js
const chairAsset = JSON.parse(localStorage.getItem('selectedChair'));

const container = $('.lower-btns');
        container.empty();

        const parts = chairAsset.parts;

        parts.forEach(part => {
            // Create radio input
            const radioInput = `<div><input type="radio" id="${part.id}" name="part" value="${part.id}" /></div>`;
            const label = `<label for="${part.id}">${part.label}</label>`;

            // Append the input and label to the container
            container.append(radioInput);
            container.append(label);
        });
let fabricPosition, legsPosition;

function annotationiconPosition (){
  if (window.matchMedia("(max-width: 768px)").matches) {
    fabricPosition = chairAsset.annotationFabricMobilePos;
    legsPosition = chairAsset.annotationLegsMobilePos;
} else {
    fabricPosition = chairAsset.annotationFabricPos;
    legsPosition = chairAsset.annotationLegsPos;
}
}

function getIconSize(mobileSize, desktopSize) {
  if (window.matchMedia("(max-width: 768px)").matches) {
    return mobileSize;
  } else {
    return desktopSize;
  }
}

const fabricIconSize = getIconSize(
  chairAsset.fabricIconSizeMobile, 
  chairAsset.fabricIconSizeDesktop
);
const legsIconSize = getIconSize(
  chairAsset.legsIconSizeMobile, 
  chairAsset.legsIconSizeDesktop
);


function init() {
  const canvas = document.getElementById("canvas");
  const { scene, camera, renderer } = initScene(canvas, chairAsset);
  CAMERA = camera;
  rendererAR = renderer;


  
  // The position of the annotation depends on the display
  annotationiconPosition ();

  oviniChair = new ModelLoader(scene, chairAsset.path, camera);
  modelOnScene = oviniChair;
    
 

  oviniChair.addAnnotation('fabric', fabricPosition, chairAsset.pathFabric,   fabricIconSize.width,
    fabricIconSize.height  );
  oviniChair.addAnnotation('legs', legsPosition, chairAsset.pathLegs,  legsIconSize.width, legsIconSize.height);
 
  //if name is all it will change for all annotations, otherwise only by name
  oviniChair.setAnnotationVisibility('all', false);

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  window.addEventListener("resize", resize);
  animate(scene, camera, renderer);

  //Updates the size of the renderer and the aspect ratio of the camera when the window resizes.
  resize();
}
init();


const arButton = ARButton.createButton(rendererAR, {
  requiredFeatures: ["hit-test"]
});
rendererAR.xr.enabled = true;
const arDiv = document.querySelector('.ar-div');
// Append the AR Button inside the 'ar-div' instead of the body
arDiv.appendChild(arButton);

arButton.addEventListener('click', () => {
  console.log("AR button clicked");
  if ($('#ARButton').text().trim() === 'AR NOT SUPPORTED') return
 console.log(oviniChair.model);
 
  oviniChair.model.visible = false;
  passModelToScene(oviniChair.model);
  sceneBackgroundSet(false);

});

/**model anotations:
 * fabric_mat,
 * metal_mat,
 * laces_mat,
 * wood_mat
 */

document.querySelector(".animations-btn").addEventListener("click", () => {
  oviniChair.setAnnotationVisibility('all', true); // Show all annotations

  activateModifierBasedOnWidth(); 
  $(".lower-btns").css("display", "none");

  // Handle fabric interaction
  oviniChair.triggerInteraction('fabric', () => {
    console.log("Fabric annotation clicked");
    animateFabric(); // Trigger fabric animation
    oviniChair.setAnnotationVisibility('all', false); // Hide annotations

    $(".close-animation").css("display", "flex");
    $(".upper-btns-container").animate({
      opacity: 0,
      top: "-20px"
    }, 400, function() {
      $(this).css("display", "none");
    });
  });

  // Handle legs interaction
  oviniChair.triggerInteraction('legs', () => {
    animatelegs(); // Trigger legs animation
    oviniChair.setAnnotationVisibility('all', false); // Hide annotations

    $(".close-animation").css("display", "flex");
    $(".upper-btns-container").animate({
      opacity: 0,
      top: "-20px"
    }, 400, function() {
      $(this).css("display", "none");
    });
  });
});


function closeAnimationBtn (){

  $(".close-animation").click(function () {
    $(".upper-btns-container").css({
      opacity: 0,       
      top: "-20px",     
      display: "flex"  
  }).animate({
      opacity: 1,      
      top: "0px"        
  }, 400);  
    activateModifierBasedOnWidth();
    oviniChair.setAnnotationVisibility('all', true);
    $(this).css("display", "none");
  
  
  });
}

closeAnimationBtn ()

document.querySelector(".configurator-btn").addEventListener("click", () => {  
  $(".close-animation").css("display", "none");
  $(".lower-btns").css("display", "flex");

  //set camera on start position
  activateModifierBasedOnWidth();

  oviniChair.setAnnotationVisibility('all', false);
});

$(document).ready(function () {
  $(window).resize(function () {   
    activateModifierBasedOnWidth();
  annotationiconPosition () 
  $(".close-animation").css("display", "none");
  
  $(".upper-btns-container").css({
    opacity: 0,       
    top: "-20px",     
    display: "flex"  
}).animate({
    opacity: 1,      
    top: "0px"        
}, 400);
  });
});

let selectedBodyColor = chairAsset.colors[0].color;
let previousBodyColor = "";
let selectedFabricColor = chairAsset.colors[0].color;
let selectedLacesColor = chairAsset.colors[0].color;
let selectedLegsColor = chairAsset.colors[0].color;

function applyMarginBasedOnChangeMobile() {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  const isCheckedRadio =
    $('.lower-btns input[type="radio"]:checked').length > 0;

  if (isMobile) {
    if (isCheckedRadio) {
      $("#canvas").css("margin-top", "-105px");
      $(".lower-btns").css({ display: "none" });
    } else {
      $(".lower-btns").css("display", "flex");
    }
  } else {
    $("#canvas").css({ "margin-top": "0" });
    $(".lower-btns").css("display", "flex");
  }

}


function animateFabric() {
  if (window.matchMedia("(max-width: 768px)").matches) {
    animateCamera(CAMERA, chairAsset.animateFabricMobile);
  } else {
    animateCamera(CAMERA, chairAsset.animateFabricDesctop);
  }
}
function animatelegs() {
  if (window.matchMedia("(max-width: 768px)").matches) {
    animateCamera(CAMERA, chairAsset.animateLegsMobile);
  } else {
    animateCamera(CAMERA, chairAsset.animateLegsDesctop);
  }
}



// event that define any chage on suitcase parts
$('.lower-btns input[type="radio"]').on("change", function () {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const selectedValue = event.target.value;
  applyMarginBasedOnChangeMobile()
  handleRadioChange(selectedValue);
  if (isMobile) {
    $("#color-picker").css("display", "flex");
  } else {
    $("#color-picker").css("display", "flex").hide().fadeIn("fast");
  }
});
// logic for each suitcase part
function handleRadioChange(selectedValue) {
  switch (selectedValue) {
    case "body":
      bodyClicked();

      break;
    case "laces":
      lacesClicked();

      break;
    case "fabric":
      fabricClicked();

      break;
    case "legs":
      legsClicked();

      break;
    default:
      break;
  }
}

// next and previous btn order
const inputs = chairAsset.parts.map(part => `#${part.id}`);
let currentIndex = 0;

function setCurrentIndex(index) {
  currentIndex = index;
}

$(".next-btn").on("click", function () {
  currentIndex = (currentIndex + 1) % inputs.length;
  $(inputs[currentIndex]).click();
});
$(".prev-btn").on("click", function () {
  currentIndex = (currentIndex - 1 + inputs.length) % inputs.length;
  $(inputs[currentIndex]).click();
});

inputs.forEach((input, index) => {
  $(input).on("click", function () {
    setCurrentIndex(index);
  });
});

const buttons = $(".configurator-btn, .animations-btn");

buttons.on("click", function () {
  $(".configurator-btn, .animations-btn").removeClass("active");
  $(this).addClass("active");
});


function closeColorPicker() {
  $("#color-picker").css("display", "none");
  $("#canvas").css({ "margin-right": "0", "margin-top": "0" });
  $('.lower-btns input[type="radio"]:checked').prop("checked", false);
  $(".upper-btns").css("display", "flex");
  $(".lower-btns").css("display", "flex");
  $("#canvas").css("height", "100vh");
  $(".upper-btns, .chose-model").css("display", "flex");
  activateModifierBasedOnWidth();

  $(".upper-btns-container").css({
    opacity: 0,       
    top: "-20px",     
    display: "flex"  
}).animate({
    opacity: 1,      
    top: "0px"        
}, 400);  
}

$(".close-popup").click(function () {
  closeColorPicker();
});

const colorCombinations = {};
const colors = chairAsset.colors.map(color => color.color);
const [firstColor, secondColor] = colors; 
colors.forEach(color => {
 
  colorCombinations[color] = Array.from(new Set([color, firstColor, secondColor]));
});

// on body color selection depends other available color option for other parts. default for body is CHROME SATIN ALUMINUM. if user chose other body color then other parts reset to default color
function updateColorOptions(selectedColor) {
  const availableColors = colorCombinations[selectedColor];

  if (availableColors === undefined) return;

  $(".color-option").each(function () {
    const option = $(this);
    if (availableColors.includes(option.data("color"))) {
      option.show().removeClass("selected");
    } else {
      option.hide();
    }
  });
}

function clearColorOptionEventListeners() {
  $(".color-option").each(function () {
    const $option = $(this);
    const $newOption = $option.clone(true);
    $option.replaceWith($newOption);
  });
}

function activateModifierBasedOnWidth() {
  if (window.matchMedia("(max-width: 768px)").matches) {

    animateCamera(CAMERA, chairAsset.cameraPosMobile);
  } else {
    animateCamera(CAMERA, chairAsset.cameraPos);
  }
}
function activateAnimationBodyPart() {
  if (window.matchMedia("(max-width: 768px)").matches) {
    animateCamera(CAMERA, chairAsset.animationBodyMobile);
  } else {
    animateCamera(CAMERA, chairAsset.animationBodyDesktop);
  }
}
function activateAnimationFabricPart() {
  if (window.matchMedia("(max-width: 768px)").matches) {
    animateCamera(CAMERA,chairAsset.animationFabricMobile);
  } else {
    animateCamera(CAMERA, chairAsset.animationFabricDesktop);
  }
}
function activateAnimationLacesPart() {
  if (window.matchMedia("(max-width: 768px)").matches) {
    animateCamera(CAMERA, chairAsset.animationLacesMobile);
  } else {
    animateCamera(CAMERA, chairAsset.animationLacesDesktop);
  }
}
function activateAnimationLegsPart() {
  if (window.matchMedia("(max-width: 768px)").matches) {
    animateCamera(CAMERA, chairAsset.animationLegsMobile);
  } else {
    animateCamera(CAMERA, chairAsset.animationLegsDesktop);
  }
}
const colorsC = chairAsset.colors;

const colorOptionsContainer = document.querySelector(".color-options");


colorOptionsContainer.innerHTML = '';

colorsC.forEach((color) => {
  const colorOption = document.createElement('div');
  colorOption.classList.add('color-option');
  colorOption.dataset.color = color.color;
  colorOption.dataset.name = color.name;

 
  if (color.color === selectedBodyColor) {
    colorOption.classList.add("selected");
  }


  colorOption.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="23" fill="${color.color}" />
      <circle cx="28" cy="28" r="27.5" stroke="#E5E5E5"/>
    </svg>
  `;

})

const colorsA = chairAsset.colors;
const colorOptionsContainerA = document.querySelector(".color-options");

colorOptionsContainerA.innerHTML = '';

colorsA.forEach((color) => {
  const colorOption = document.createElement('div');
  colorOption.classList.add('color-option');
  colorOption.dataset.color = color.color;
  colorOption.dataset.name = color.name;

 
  if (color.color === selectedBodyColor) {
    colorOption.classList.add("selected");
  }

  colorOption.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="23" fill="${color.color}" />
      <circle cx="28" cy="28" r="27.5" stroke="#E5E5E5"/>
    </svg>
  `;
  colorOptionsContainerA.appendChild(colorOption);
})

function bodyClicked() {
  
  $(".title-x .title").text(chairAsset.parts[0].label);
  // $(".color-picker").css("display", "flex");
  activateAnimationBodyPart();

  $(".upper-btns-container").animate({
    opacity: 0,     
    top: "-20px"    
}, 400, function() {

    $(this).css("display", "none");
});
  clearColorOptionEventListeners();

 
  const colors = chairAsset.colors;
  const materials = chairAsset.materials;

    const colorOptions = document.querySelectorAll(".color-option");
    colorOptions.forEach((colorOption) => {
      colorOption.style.display = "flex";  
      
    // Check if the color option matches the selected body color
    if (colorOption.dataset.color === selectedBodyColor) {
      colorOption.classList.add("selected"); 
    } else {
      colorOption.classList.remove("selected"); 
    }
    colorOption.addEventListener("click", function () {
      // Deselect all color options
      document.querySelectorAll(".color-option").forEach((opt) => opt.classList.remove("selected"));
      
      // Mark the clicked one as selected
      this.classList.add("selected");

      // Update selectedBodyColor
      selectedBodyColor = this.dataset.color;

      // Update the color-chosen text
      document.querySelector(".color-chosen").textContent = this.dataset.name;
      // Update model colors accordingly
      selectedFabricColor = chairAsset.colors[0].color; // Set defaults for other parts
      selectedLegsColor = chairAsset.colors[0].color;
      selectedLacesColor = chairAsset.colors[0].color;
      const partsC = chairAsset.parts.reduce((acc, part) => {
        acc[part.id] = part.label;
        return acc;
      }, {});
      if (partsC.body) {
        modelOnScene.changeModelColor(materials.body, selectedBodyColor);
      }
      if (partsC.fabric) {
        selectedFabricColor = colorsC[0].color;
        modelOnScene.changeModelColor(materials.fabric, selectedFabricColor);
      }
      if (partsC.laces) {
        selectedLacesColor = colorsC[0].color;
        modelOnScene.changeModelColor(materials.laces, selectedLacesColor);
      }
      if (partsC.legs) {
        selectedLegsColor = colorsC[0].color;
        modelOnScene.changeModelColor(materials.legs, selectedLegsColor);
      }
    });

  });

  // Update initially chosen color if any
  document.querySelector(".color-chosen").textContent = document.querySelector(".color-option.selected")?.dataset.name || colors[0].name;

 
  if (selectedBodyColor !== "") {
    modelOnScene.changeModelColor(materials.body, selectedBodyColor);
  } else {
    
    modelOnScene.changeModelColor(materials.body, colors[0].color);
  }
}


function setupColorOptions(partType, selectedColor, defaultColor, partObjects) {
  const colorOptions = document.querySelectorAll(".color-option");
  document.querySelector(".color-chosen").textContent = $(
    ".color-option.selected"
  ).data("name");
  colorOptions.forEach((option) => {
    option.classList.remove("selected");
    if (selectedColor !== "") {
      if (option.dataset.color === selectedColor) {
        option.classList.add("selected");
        document.querySelector(".color-chosen").textContent =
          option.dataset.name;
      }
    } else {
      colorOptions[0].classList.add("selected");
      document.querySelector(".color-chosen").textContent = $(
        ".color-option.selected"
      ).data("name");
    }

    if (previousBodyColor !== "" && selectedBodyColor !== previousBodyColor) {
      option.classList.remove("selected");
      colorOptions[0].classList.add("selected");
      modelOnScene.changeModelColor(partObjects, defaultColor);
    } else {
      modelOnScene.changeModelColor(partObjects, selectedColor);
    }

    option.addEventListener("click", function () {
      colorOptions.forEach((opt) => opt.classList.remove("selected"));
      this.classList.add("selected");
      const newColor = this.dataset.color;

      // Set the correct global variable based on the part type
      switch (partType) {
        case "fabric":
          selectedFabricColor = newColor;
          break;
        case "laces":
          selectedLacesColor = newColor;
          break;
        case "legs":
          selectedLegsColor = newColor;
          break;
        default:
          break;
      }

      document.querySelector(".color-chosen").textContent = this.dataset.name;
      modelOnScene.changeModelColor(partObjects, newColor);
    });
  });
}

function fabricClicked() {
  $(".title-x .title").text(chairAsset.parts[1].label);
  activateAnimationFabricPart();
  $(".upper-btns, .chose-model").css("display", "none");
  clearColorOptionEventListeners();
  updateColorOptions(selectedBodyColor);
  setupColorOptions("fabric", selectedFabricColor, "#d4c8a3", chairAsset.materials.fabric);
}

function lacesClicked() {
  $(".title-x .title").text(chairAsset.parts[2].label);
  $(".upper-btns, .chose-model").css("display", "none");
  activateAnimationLacesPart();
  clearColorOptionEventListeners();
  updateColorOptions(selectedBodyColor);
  setupColorOptions("laces", selectedLacesColor, "#d4c8a3", chairAsset.materials.laces);
}

function legsClicked() {
  $(".title-x .title").text(chairAsset.parts[3].label);
  $(".upper-btns, .chose-model").css("display", "none");
  activateAnimationLegsPart();
  clearColorOptionEventListeners();
  updateColorOptions(selectedBodyColor);
  setupColorOptions("legs", selectedLegsColor, "#d4c8a3", chairAsset.materials.legs);
}

function handleImageDisplay(inputSelector, shouldDisplay) {
  $(inputSelector).click(function () {
    $(".no-image, .no-image-text").css(
      "display",
      shouldDisplay ? "flex" : "none"
    );
  });
}

handleImageDisplay("input#laces, input#fabric, input#legs", false);
handleImageDisplay("input#body", true);

$(".left-btn").on("click", function () {
  $(".color-options").animate({ scrollLeft: "-=100px" }, "smooth");
});

$(".right-btn").on("click", function () {
  $(".color-options").animate({ scrollLeft: "+=100px" }, "smooth");
});
$(".chose-model").on("click", function () {
  window.location.href = 'index.html';
});


$(document).ready(function() {
  if (chairAsset.parts.length <= 1) {  
    $('.next-wrapper').css("display" , "none");
  }
});