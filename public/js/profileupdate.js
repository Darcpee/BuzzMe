const token = localStorage.getItem("token");

const formData = new FormData();

formData.append("userName", userName.value);

if (avatarInput.files.length > 0) {

    formData.append(
        "profileImage",
        avatarInput.files[0]
    );

}

const response = await fetch(
    "http://localhost:4600/updateProfile",
    {

        method: "PUT",

        headers: {
            Authorization: `Bearer ${token}`
        },

        body: formData

    }
);

const data = await response.json();

console.log(data);