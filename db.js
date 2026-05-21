// db.js - Système d'Authentification et de Base de Données (Local et/ou Firebase)

(function () {
    // Mode de fonctionnement (par défaut localstorage, prêt pour Firebase)
    const CONFIG = {
        useFirebase: false, // Passer à true pour connecter Firebase
        firebaseConfig: {
            apiKey: "VOTRE_API_KEY",
            authDomain: "VOTRE_AUTH_DOMAIN",
            projectId: "VOTRE_PROJECT_ID",
            storageBucket: "VOTRE_STORAGE_BUCKET",
            messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
            appId: "VOTRE_APP_ID"
        }
    };

    // --- INITIALISATION DES DONNÉES EN MODE LOCALSTORAGE ---
    const defaultReviews = [
        {
            id: "1",
            title: "The Witcher 3: Wild Hunt",
            category: "RPG",
            developer: "CD Projekt Red",
            publisher: "CD Projekt",
            releaseDate: "2015-05-19",
            synopsis: "Incarnez Geralt de Riv, un chasseur de monstres professionnel à la recherche de sa fille adoptive, Ciri, dans un monde ouvert vaste et riche.",
            description: "The Witcher 3 est un chef-d'œuvre incontestable du jeu de rôle. Avec son écriture d'une profondeur rare, ses quêtes secondaires qui surpassent souvent les quêtes principales d'autres jeux, et son univers sombre et mature, il a redéfini le genre. La réalisation artistique et la bande-son celtique immersive couronnent cette aventure épique que tout joueur se doit de parcourir.",
            imageUrl: "img/refonte.png", // Réutilisation d'une image existante du portfolio
            ratings: {
                graphics: 92,
                gameplay: 90,
                sound: 95,
                lifespan: 98
            },
            overallScore: 94,
            author: "Admin",
            createdAt: new Date("2026-05-10T10:00:00Z").toISOString(),
            votes: { upvotes: ["123", "456"], downvotes: [] }
        },
        {
            id: "2",
            title: "Cyberpunk 2077",
            category: "Action",
            developer: "CD Projekt Red",
            publisher: "CD Projekt",
            releaseDate: "2020-12-10",
            synopsis: "Explorez l'immense métropole de Night City dans la peau de V, un mercenaire hors-la-loi à la recherche d'un implant unique qui détient la clé de l'immortalité.",
            description: "Après des débuts difficiles, Cyberpunk 2077 s'est imposé comme une expérience de science-fiction majeure. Night City est l'une des villes les plus détaillées, verticales et graphiquement impressionnantes jamais créées. L'histoire principale est captivante, portée par une mise en scène immersive à la première personne et une bande-son industrielle survoltée.",
            imageUrl: "img/rappeur.png", // Réutilisation d'une image existante du portfolio
            ratings: {
                graphics: 96,
                gameplay: 85,
                sound: 92,
                lifespan: 80
            },
            overallScore: 88,
            author: "Admin",
            createdAt: new Date("2026-05-15T14:30:00Z").toISOString(),
            votes: { upvotes: ["123"], downvotes: ["456"] }
        },
        {
            id: "3",
            title: "Hades",
            category: "Indé",
            developer: "Supergiant Games",
            publisher: "Supergiant Games",
            releaseDate: "2020-09-17",
            synopsis: "Frayez-vous un chemin hors des Enfers en défiant le dieu des morts dans ce rogue-like dynamique et narratif.",
            description: "Hades marie à la perfection l'action frénétique du hack'n'slash et une narration progressive extrêmement intelligente. Chaque tentative d'évasion apporte de nouvelles lignes de dialogues entièrement doublées et fait progresser l'histoire. La direction artistique colorée, le rythme de jeu addictif et les musiques heavy metal mythologiques en font un titre exceptionnel.",
            imageUrl: "img/cuisine.png", // Réutilisation d'une image existante
            ratings: {
                graphics: 90,
                gameplay: 95,
                sound: 94,
                lifespan: 88
            },
            overallScore: 92,
            author: "Admin",
            createdAt: new Date("2026-05-20T08:15:00Z").toISOString(),
            votes: { upvotes: ["123", "456", "789"], downvotes: [] }
        }
    ];

    const defaultComments = [
        {
            id: "c1",
            gameId: "1",
            userId: "123",
            userName: "GamerPro",
            userAvatar: "img/profile-placeholder.png",
            text: "Totalement d'accord avec cette critique ! Ce jeu est tout simplement intemporel, je l'ai fini 3 fois.",
            createdAt: new Date("2026-05-11T12:00:00Z").toISOString()
        },
        {
            id: "c2",
            gameId: "1",
            userId: "456",
            userName: "NekoLover",
            userAvatar: "img/profile-placeholder.png",
            text: "Les quêtes de Bloody Baron sont inoubliables. Un grand jeu.",
            createdAt: new Date("2026-05-12T15:20:00Z").toISOString()
        },
        {
            id: "c3",
            gameId: "2",
            userId: "123",
            userName: "GamerPro",
            userAvatar: "img/profile-placeholder.png",
            text: "Avec les patchs 2.0+ et Phantom Liberty, c'est devenu un de mes jeux préférés. L'ambiance est incroyable.",
            createdAt: new Date("2026-05-16T18:00:00Z").toISOString()
        }
    ];

    const defaultUsers = [
        {
            uid: "admin-id",
            email: "admin@gamecritique.com",
            displayName: "Administrateur",
            avatar: "img/profile-placeholder.png",
            role: "admin",
            password: "admin123" // Stockage simple pour la simulation locale
        },
        {
            uid: "google_admin",
            email: "zobirfathallah@gmail.com",
            displayName: "Zobir Fathallah",
            avatar: "img/profile-placeholder.png",
            role: "admin",
            password: ""
        }
    ];

    // Initialisation du localStorage si vide
    if (!localStorage.getItem("gc_reviews")) {
        localStorage.setItem("gc_reviews", JSON.stringify(defaultReviews));
    }
    if (!localStorage.getItem("gc_comments")) {
        localStorage.setItem("gc_comments", JSON.stringify(defaultComments));
    }
    if (!localStorage.getItem("gc_users")) {
        localStorage.setItem("gc_users", JSON.stringify(defaultUsers));
    }

    // --- LE SERVICE D'AUTHENTIFICATION ET DE BASE DE DONNÉES ---
    const GameCritiqueDB = {
        // --- AUTHENTIFICATION ---
        auth: {
            signUp: function (email, password, displayName) {
                const users = JSON.parse(localStorage.getItem("gc_users") || "[]");
                if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
                    throw new Error("Cet e-mail est déjà utilisé.");
                }
                const newUser = {
                    uid: "user_" + Date.now(),
                    email: email,
                    displayName: displayName || email.split('@')[0],
                    avatar: "img/profile-placeholder.png",
                    role: "user",
                    password: password
                };
                users.push(newUser);
                localStorage.setItem("gc_users", JSON.stringify(users));
                localStorage.setItem("gc_current_user", JSON.stringify({
                    uid: newUser.uid,
                    email: newUser.email,
                    displayName: newUser.displayName,
                    avatar: newUser.avatar,
                    role: newUser.role
                }));
                return newUser;
            },

            login: function (email, password) {
                const users = JSON.parse(localStorage.getItem("gc_users") || "[]");
                const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
                if (!user) {
                    throw new Error("Identifiants incorrects.");
                }
                const sessionUser = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    avatar: user.avatar,
                    role: user.role
                };
                localStorage.setItem("gc_current_user", JSON.stringify(sessionUser));
                return sessionUser;
            },

            loginWithGoogle: function (email, displayName) {
                const users = JSON.parse(localStorage.getItem("gc_users") || "[]");
                let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
                
                // Définir le rôle selon l'e-mail
                const isGoogleAdmin = email.toLowerCase() === "zobirfathallah@gmail.com";
                const role = isGoogleAdmin ? "admin" : "user";

                if (!user) {
                    user = {
                        uid: "google_" + Date.now(),
                        email: email,
                        displayName: displayName || email.split('@')[0],
                        avatar: "img/profile-placeholder.png",
                        role: role,
                        password: "" // Pas de mot de passe car connecté avec Google
                    };
                    users.push(user);
                    localStorage.setItem("gc_users", JSON.stringify(users));
                } else if (isGoogleAdmin && user.role !== "admin") {
                    // Forcer la mise à jour du rôle si déjà inscrit mais pas encore admin
                    user.role = "admin";
                    localStorage.setItem("gc_users", JSON.stringify(users));
                }
                const sessionUser = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    avatar: user.avatar,
                    role: user.role
                };
                localStorage.setItem("gc_current_user", JSON.stringify(sessionUser));
                return sessionUser;
            },

            logout: function () {
                localStorage.removeItem("gc_current_user");
            },

            getCurrentUser: function () {
                const userJson = localStorage.getItem("gc_current_user");
                return userJson ? JSON.parse(userJson) : null;
            }
        },

        // --- GESTION DES CRITIQUES ---
        reviews: {
            getAll: function () {
                return JSON.parse(localStorage.getItem("gc_reviews") || "[]");
            },

            getById: function (id) {
                const reviews = JSON.parse(localStorage.getItem("gc_reviews") || "[]");
                return reviews.find(r => r.id === id) || null;
            },

            add: function (reviewData) {
                const currentUser = GameCritiqueDB.auth.getCurrentUser();
                if (!currentUser || currentUser.role !== "admin") {
                    throw new Error("Seul un administrateur peut ajouter une critique.");
                }
                const reviews = JSON.parse(localStorage.getItem("gc_reviews") || "[]");
                
                // Calcul du score global (moyenne des 4 critères)
                const g = parseInt(reviewData.ratings.graphics) || 0;
                const gp = parseInt(reviewData.ratings.gameplay) || 0;
                const s = parseInt(reviewData.ratings.sound) || 0;
                const l = parseInt(reviewData.ratings.lifespan) || 0;
                const score = Math.round((g + gp + s + l) / 4);

                const newReview = {
                    id: "game_" + Date.now(),
                    title: reviewData.title,
                    category: reviewData.category,
                    developer: reviewData.developer || "Inconnu",
                    publisher: reviewData.publisher || "Inconnu",
                    releaseDate: reviewData.releaseDate || new Date().toISOString().split('T')[0],
                    synopsis: reviewData.synopsis,
                    description: reviewData.description,
                    imageUrl: reviewData.imageUrl || "img/profile-placeholder.png",
                    musicUrl: reviewData.musicUrl || null,
                    ratings: {
                        graphics: g,
                        gameplay: gp,
                        sound: s,
                        lifespan: l
                    },
                    overallScore: score,
                    author: currentUser.displayName,
                    createdAt: new Date().toISOString(),
                    votes: { upvotes: [], downvotes: [] }
                };

                reviews.unshift(newReview); // Placer en premier
                localStorage.setItem("gc_reviews", JSON.stringify(reviews));
                return newReview;
            },

            delete: function (id) {
                const currentUser = GameCritiqueDB.auth.getCurrentUser();
                if (!currentUser || currentUser.role !== "admin") {
                    throw new Error("Seul un administrateur peut supprimer une critique.");
                }
                let reviews = JSON.parse(localStorage.getItem("gc_reviews") || "[]");
                reviews = reviews.filter(r => r.id !== id);
                localStorage.setItem("gc_reviews", JSON.stringify(reviews));

                // Supprimer également les commentaires associés
                let comments = JSON.parse(localStorage.getItem("gc_comments") || "[]");
                comments = comments.filter(c => c.gameId !== id);
                localStorage.setItem("gc_comments", JSON.stringify(comments));
            },

            update: function (id, updatedData) {
                const currentUser = GameCritiqueDB.auth.getCurrentUser();
                if (!currentUser || currentUser.role !== "admin") {
                    throw new Error("Seul un administrateur peut modifier une critique.");
                }
                const reviews = JSON.parse(localStorage.getItem("gc_reviews") || "[]");
                const review = reviews.find(r => r.id === id);
                if (!review) throw new Error("Critique introuvable.");

                // Recalculer le score global
                const g = parseInt(updatedData.ratings.graphics) || review.ratings.graphics;
                const gp = parseInt(updatedData.ratings.gameplay) || review.ratings.gameplay;
                const s = parseInt(updatedData.ratings.sound) || review.ratings.sound;
                const l = parseInt(updatedData.ratings.lifespan) || review.ratings.lifespan;

                review.title = updatedData.title || review.title;
                review.category = updatedData.category || review.category;
                review.developer = updatedData.developer || review.developer;
                review.publisher = updatedData.publisher || review.publisher;
                review.releaseDate = updatedData.releaseDate || review.releaseDate;
                review.synopsis = updatedData.synopsis || review.synopsis;
                review.description = updatedData.description || review.description;
                if (updatedData.imageUrl) review.imageUrl = updatedData.imageUrl;
                if (updatedData.musicUrl !== undefined) review.musicUrl = updatedData.musicUrl || null;
                review.ratings = { graphics: g, gameplay: gp, sound: s, lifespan: l };
                review.overallScore = Math.round((g + gp + s + l) / 4);
                review.updatedAt = new Date().toISOString();

                localStorage.setItem("gc_reviews", JSON.stringify(reviews));
                return review;
            }
        },

        // --- GESTION DES COMMENTAIRES ---
        comments: {
            getByGameId: function (gameId) {
                const comments = JSON.parse(localStorage.getItem("gc_comments") || "[]");
                return comments
                    .filter(c => c.gameId === gameId)
                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            },

            add: function (gameId, text) {
                const currentUser = GameCritiqueDB.auth.getCurrentUser();
                if (!currentUser) {
                    throw new Error("Vous devez être connecté pour écrire un commentaire.");
                }
                const comments = JSON.parse(localStorage.getItem("gc_comments") || "[]");
                const newComment = {
                    id: "c_" + Date.now(),
                    gameId: gameId,
                    userId: currentUser.uid,
                    userName: currentUser.displayName,
                    userAvatar: currentUser.avatar,
                    text: text,
                    createdAt: new Date().toISOString()
                };
                comments.push(newComment);
                localStorage.setItem("gc_comments", JSON.stringify(comments));
                return newComment;
            },

            delete: function (commentId) {
                const currentUser = GameCritiqueDB.auth.getCurrentUser();
                if (!currentUser) throw new Error("Vous devez être connecté.");
                let comments = JSON.parse(localStorage.getItem("gc_comments") || "[]");
                const comment = comments.find(c => c.id === commentId);
                if (!comment) throw new Error("Commentaire introuvable.");
                if (currentUser.role !== "admin" && currentUser.uid !== comment.userId) {
                    throw new Error("Vous ne pouvez supprimer que vos propres commentaires.");
                }
                comments = comments.filter(c => c.id !== commentId);
                localStorage.setItem("gc_comments", JSON.stringify(comments));
            },

            edit: function (commentId, newText) {
                const currentUser = GameCritiqueDB.auth.getCurrentUser();
                if (!currentUser) throw new Error("Vous devez être connecté.");
                const comments = JSON.parse(localStorage.getItem("gc_comments") || "[]");
                const comment = comments.find(c => c.id === commentId);
                if (!comment) throw new Error("Commentaire introuvable.");
                if (currentUser.role !== "admin" && currentUser.uid !== comment.userId) {
                    throw new Error("Vous ne pouvez modifier que vos propres commentaires.");
                }
                comment.text = newText;
                comment.editedAt = new Date().toISOString();
                localStorage.setItem("gc_comments", JSON.stringify(comments));
                return comment;
            }
        },

        // --- GESTION DES VOTES ---
        votes: {
            vote: function (gameId, voteType) {
                const currentUser = GameCritiqueDB.auth.getCurrentUser();
                if (!currentUser) {
                    throw new Error("Vous devez être connecté pour voter.");
                }
                const reviews = JSON.parse(localStorage.getItem("gc_reviews") || "[]");
                const review = reviews.find(r => r.id === gameId);
                if (!review) throw new Error("Critique introuvable.");

                const userId = currentUser.uid;
                if (!review.votes) {
                    review.votes = { upvotes: [], downvotes: [] };
                }

                // Retirer des votes existants
                review.votes.upvotes = review.votes.upvotes.filter(id => id !== userId);
                review.votes.downvotes = review.votes.downvotes.filter(id => id !== userId);

                // Ajouter le nouveau vote
                if (voteType === "up") {
                    review.votes.upvotes.push(userId);
                } else if (voteType === "down") {
                    review.votes.downvotes.push(userId);
                }

                localStorage.setItem("gc_reviews", JSON.stringify(reviews));
                return review.votes;
            },

            getVotes: function (gameId) {
                const review = this.getById(gameId);
                return review && review.votes ? review.votes : { upvotes: [], downvotes: [] };
            }
        }
    };

    // Rendre disponible dans la fenêtre globale
    window.GameCritiqueDB = GameCritiqueDB;

    // Injecter la pop-up d'informations "À propos" sitewide
    document.addEventListener("DOMContentLoaded", function() {
        const infoDiv = document.createElement("div");
        infoDiv.innerHTML = `
            <div class="info-popup-trigger" id="gc-info-trigger" title="À propos de GameCritique">ℹ</div>
            <div class="info-popup-card" id="gc-info-card">
                <button class="close-info-btn" id="gc-info-close">&times;</button>
                <h4>À propos de GameCritique</h4>
                <p>Bienvenue sur GameCritique, votre destination ultime pour les critiques de jeux vidéo.</p>
                <p>Rejoignez notre communauté pour voter pour vos tests préférés, participer aux discussions et partager votre passion !</p>
            </div>
        `;
        document.body.appendChild(infoDiv);

        const trigger = document.getElementById("gc-info-trigger");
        const card = document.getElementById("gc-info-card");
        const closeBtn = document.getElementById("gc-info-close");

        // Ouvrir / Fermer au clic
        trigger.addEventListener("click", function(e) {
            e.stopPropagation();
            card.classList.toggle("show");
        });

        closeBtn.addEventListener("click", function(e) {
            e.stopPropagation();
            card.classList.remove("show");
        });

        // Fermer si clic ailleurs
        document.addEventListener("click", function(e) {
            if (!card.contains(e.target) && e.target !== trigger) {
                card.classList.remove("show");
            }
        });
    });
})();
