const imageInput = document.getElementById("imageInput");

const preview = document.getElementById("preview");

const previewContainer =
    document.getElementById("previewContainer");

const predictButton =
    document.getElementById("predictButton");

const loading =
    document.getElementById("loading");

const result =
    document.getElementById("result");

const predictedClass =
    document.getElementById("predictedClass");

const confidence =
    document.getElementById("confidence");

const progressBar =
    document.getElementById("progressBar");

const error =
    document.getElementById("error");


// --------------------------------------------------
// When user selects an image
// --------------------------------------------------

imageInput.addEventListener(
    "change",
    function () {

        const file = this.files[0];

        if (!file) {
            return;
        }


        // Make sure it is an image

        if (!file.type.startsWith("image/")) {

            showError(
                "Please select a valid image."
            );

            return;
        }


        // Preview image

        const imageURL =
            URL.createObjectURL(file);

        preview.src = imageURL;

        previewContainer.style.display =
            "block";


        // Enable predict button

        predictButton.disabled = false;


        // Hide old results

        result.style.display = "none";

        error.style.display = "none";

    }
);


// --------------------------------------------------
// Predict button
// --------------------------------------------------

predictButton.addEventListener(
    "click",
    async function () {

        const file = imageInput.files[0];

        if (!file) {

            showError(
                "Please select an image first."
            );

            return;
        }


        // ------------------------------------------
        // Create FormData
        // ------------------------------------------

        const formData = new FormData();

        formData.append(
            "file",
            file
        );


        // ------------------------------------------
        // UI state
        // ------------------------------------------

        predictButton.disabled = true;

        loading.style.display = "block";

        result.style.display = "none";

        error.style.display = "none";


        try {

            // --------------------------------------
            // Send request to FastAPI
            // --------------------------------------

            const response = await fetch(
                "http://127.0.0.1:8000/predict",
                {
                    method: "POST",

                    body: formData
                }
            );


            // --------------------------------------
            // Get JSON response
            // --------------------------------------

            const data = await response.json();


            // --------------------------------------
            // Check response
            // --------------------------------------

            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Prediction failed."
                );

            }


            // --------------------------------------
            // Display prediction
            // --------------------------------------

            predictedClass.textContent =
                data.class;


            confidence.textContent =
                data.confidence_percentage + "%";


            progressBar.style.width =
                data.confidence_percentage + "%";


            result.style.display =
                "block";


        }

        catch (err) {

            showError(
                err.message
            );

        }

        finally {

            loading.style.display =
                "none";

            predictButton.disabled =
                false;

        }

    }
);


// --------------------------------------------------
// Error function
// --------------------------------------------------

function showError(message) {

    error.textContent = message;

    error.style.display = "block";

}