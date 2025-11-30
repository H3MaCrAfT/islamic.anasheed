
        const firebaseConfig = {
            apiKey: "AIzaSy...",
            authDomain: "your-project.firebaseapp.com",
            projectId: "your-project",
            storageBucket: "your-project.appspot.com",
            messagingSenderId: "...",
            appId: "..."
        };

        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();
        const storage = firebase.storage();

        const adminLoginContainer = document.getElementById('admin-login-container');
        const adminLoginBtn = document.getElementById('admin-login-btn');
        const adminPasswordInput = document.getElementById('admin-password-input');
        const adminLogoutBtn = document.getElementById('admin-logout-btn');
        const adminPanel = document.getElementById('admin-panel');
        const uploadForm = document.getElementById('upload-form');
        const anasheedList = document.getElementById('anasheed-list');
        const audioPlayer = document.getElementById('audio-player');

        const ADMIN_PASSWORDS = ['MOHA1432', 'EBRA1432'];

        function showAdminUI() {
            adminLoginContainer.style.display = 'none';
            adminLogoutBtn.style.display = 'block';
            adminPanel.style.display = 'block';
        }

        function hideAdminUI() {
            adminLoginContainer.style.display = 'flex'; 
            adminLogoutBtn.style.display = 'none';
            adminPanel.style.display = 'none';
            adminPasswordInput.value = '';
        }
        
        function addNasheedToPage(data) {
            const item = document.createElement('div');
            item.className = 'nasheed-item';
            item.innerHTML = `
                <img src="${data.imageUrl}" alt="${data.title}">
                <h3>${data.title}</h3>
                <p>${data.artist}</p>
            `;
            
            item.onclick = () => {
                audioPlayer.src = data.audioUrl;
                audioPlayer.play();
            };

            anasheedList.prepend(item);
        }

        adminLoginBtn.addEventListener('click', () => {
            const enteredPassword = adminPasswordInput.value;
            if (ADMIN_PASSWORDS.includes(enteredPassword)) {
                localStorage.setItem('isAdminLoggedIn', 'true');
                showAdminUI();
            } else {
                alert('كلمة المرور غير صحيحة!');
            }
        });

        adminLogoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isAdminLoggedIn');
            hideAdminUI();
        });

        uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitButton = uploadForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'جاري الرفع...';

            const title = document.getElementById('title').value;
            const artist = document.getElementById('artist').value;
            const audioFile = document.getElementById('audio-file').files[0];
            const imageFile = document.getElementById('image-file').files[0];

            const audioRef = storage.ref().child('anasheed/' + audioFile.name);
            audioRef.put(audioFile).then(snapshot => {
                return snapshot.ref.getDownloadURL();
            }).then(audioUrl => {
                const imageRef = storage.ref().child('images/' + imageFile.name);
                return imageRef.put(imageFile).then(snapshot => {
                    return snapshot.ref.getDownloadURL();
                }).then(imageUrl => {
                    const newNasheedData = { title, artist, audioUrl, imageUrl };
                    return db.collection("anasheed").add(newNasheedData);
                }).then(() => {
                    addNasheedToPage({ title, artist, audioUrl, imageUrl });
                    uploadForm.reset();
                    alert('تم رفع النشيد بنجاح!');
                });
            }).catch(error => {
                console.error("Error during upload:", error);
                alert('حدث خطأ أثناء الرفع.');
            }).finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = 'رفع النشيد';
            });
        });


        document.addEventListener('DOMContentLoaded', () => {
            if (localStorage.getItem('isAdminLoggedIn') === 'true') {
                showAdminUI();
            } else {
                hideAdminUI();
            }

            db.collection("anasheed").orderBy("createdAt", "desc").get().then((querySnapshot) => {
                anasheedList.innerHTML = '';
                if (querySnapshot.empty) {
                    anasheedList.innerHTML = '<p>لا توجد أناشيد حالياً.</p>';
                    return;
                }
                querySnapshot.forEach((doc) => {
                    addNasheedToPage(doc.data());
                });
            }).catch(error => {
                console.error("Error getting documents: ", error);
                anasheedList.innerHTML = '<p>حدث خطأ في تحميل الأناشيد.</p>';
            });
        });