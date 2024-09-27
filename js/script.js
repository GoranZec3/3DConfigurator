import assets from "./assets.js";

$(document).ready(function () {
  if ($(".model").length) {
    $(".model").on("click", function () {
      const chairId = $(this).data("chair-id");

      const selectedChair = assets.find(
        (chair) => chair.id === chairId.toString()
      );

      if (selectedChair) {
        localStorage.setItem("selectedChair", JSON.stringify(selectedChair));
        window.location.href = "chair.html";
      } else {
        console.error("Chair not found in assets");
      }
    });
  }
});
