document.addEventListener('DOMContentLoaded', function() {
    const newPostBtn = document.getElementById('newPostBtn');
    const postForm = document.getElementById('postForm');
    const submitPostBtn = document.getElementById('submitPost');
    const cancelPostBtn = document.getElementById('cancelPost');
    const postsList = document.getElementById('postsList');
    
    let posts = JSON.parse(sessionStorage.getItem('forumPosts')) || [];
    
    // Display existing posts
    renderPosts();
    
    // Show post form
    newPostBtn.addEventListener('click', function() {
        postForm.style.display = 'block';
    });
    
    // Cancel post
    cancelPostBtn.addEventListener('click', function() {
        postForm.style.display = 'none';
        document.getElementById('postTitle').value = '';
        document.getElementById('postContent').value = '';
    });
    
    // Submit new post
    submitPostBtn.addEventListener('click', function() {
        const title = document.getElementById('postTitle').value.trim();
        const content = document.getElementById('postContent').value.trim();
        
        if (!title || !content) {
            alert('Please fill in both title and content');
            return;
        }
        
        const newPost = {
            id: Date.now(),
            title: title,
            content: content,
            timestamp: new Date().toLocaleString()
        };
        
        posts.unshift(newPost); // Add new post to beginning of array
        sessionStorage.setItem('forumPosts', JSON.stringify(posts));
        
        renderPosts();
        postForm.style.display = 'none';
        document.getElementById('postTitle').value = '';
        document.getElementById('postContent').value = '';
    });
    
    function renderPosts() {
        if (posts.length === 0) {
            postsList.innerHTML = '<p>No posts yet. Be the first to start a discussion!</p>';
            return;
        }
        
        postsList.innerHTML = posts.map(post => `
            <div class="post" id="post-${post.id}">
                <div class="post-title">${post.title}</div>
                <div class="post-content">${post.content}</div>
                <div class="post-meta">Posted on ${post.timestamp}</div>
            </div>
        `).join('');
    }
});
