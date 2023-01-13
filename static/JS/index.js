const send = document.querySelector(".send");
const preview = document.querySelector(".preview");
const previewImage = document.querySelector("#previewImage");
const fileUploader = document.querySelector(".fileUploader");
const messageFrame = document.querySelector(".messageFrame");
const closeIcon = document.querySelector(".closeIcon");
const noticeWindow = document.querySelector(".noticeWindow");
const noticeMain = document.querySelector(".noticeMain");
const firstHr = document.querySelector(".firstHr");

let imageType;
let arrayBuffer;

closeIcon.addEventListener("click",function(){
    noticeWindow.style.display="none";
})

fetch("/imageupload").then((response) => {
    return response.json();
}).then((data) => {
    data.forEach(element => {
    const messageContent = document.createElement("div");
    messageContent.setAttribute("class","messageContent");
    messageContent.textContent = element.message;
    messageFrame.appendChild(messageContent);
    const uploadImage = document.createElement("div");
    uploadImage.setAttribute("class","uploadImage");
    messageFrame.appendChild(uploadImage);
    const img = document.createElement("img");
    img.setAttribute("src",element.image);
    uploadImage.appendChild(img);
    const hr = document.createElement("hr");
    messageFrame.appendChild(hr);
    });        
}).catch((error) => {
    console.log("錯誤:",error)
});

// 預覽照片
fileUploader.addEventListener("change", (e) => {
    preview.style.display="block";
    const imageFile = e.target.files[0];
    imageType = imageFile["type"].slice(6)
    const reader = new FileReader();
    reader.readAsArrayBuffer(imageFile)
    // 這會在readAS後才執行
    reader.onload =  () => {
        arrayBuffer = reader.result;
        const blob = new Blob([arrayBuffer], {type:`image/${imageType}`});
        previewImage.src = URL.createObjectURL(blob);
    };
});

// 將照片送到後端
send.addEventListener("click",() => {
    const file = document.querySelector('input[type="file"]');
    const contentInput = document.querySelector(".contentInput");
    const imageFile = file.files[0];
    let formData = new FormData();
    formData.append("image", imageFile)
    formData.append("messageText", contentInput.value)
    fetch("/imageupload",{
        method:"POST",
        body:formData            
    }).then((response) => {
        return response.json();
    }).then((data) => {
        if (data.error == true){
            noticeWindow.style.display="block";
            noticeMain.innerText = data.message;
        }else{
            preview.style.display="none";
            fetch("/imagenew").then((response) => {
                return response.json();
            }).then((data) => {
                const messageBlock = document.createElement("div");
                messageBlock.setAttribute("class","messageBlock");
                const messageContent = document.createElement("div");
                messageContent.setAttribute("class","messageContent");
                messageContent.textContent = data.message;
                messageBlock.appendChild(messageContent);
                const uploadImage = document.createElement("div");
                uploadImage.setAttribute("class","uploadImage");
                messageBlock.appendChild(uploadImage);
                const img = document.createElement("img");
                img.setAttribute("src",data.image);
                uploadImage.appendChild(img);
                const hr = document.createElement("hr");
                messageBlock.appendChild(hr);
                insertAfter(messageBlock,firstHr);
                contentInput.value = "";
                file.value = "";
            }).catch((error) => {
                console.log("錯誤:",error)
            });
        }
    }).catch((error) => {
        console.log("錯誤:",error)
    });
})

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
