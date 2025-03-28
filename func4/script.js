const apiKey = 'pub_76795363eb91154b23f61dd598faae77d98a0';
const apiUrl = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=agriculture&country=in`;

function truncateWords(str, no_words) {
    return str.split(" ").splice(0, no_words).join(" ");
}

document.addEventListener('DOMContentLoaded', () => {
    const newsArticlesContainer = document.getElementById('news-articles');

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                data.results.forEach(article => {
                    const articleDiv = document.createElement('div');
                    articleDiv.classList.add('news-article');

                    const title = document.createElement('h3');
                    title.textContent = article.title || 'No Title';

                    const description = document.createElement('p');
                    const fullContent = article.description || article.content || 'No Description';
                    description.textContent = truncateWords(fullContent, 100);

                    const link = document.createElement('a');
                    link.href = article.link || '#';
                    link.textContent = 'Read Full Article';
                    link.target = '_blank';

                    articleDiv.appendChild(title);
                    articleDiv.appendChild(description);
                    articleDiv.appendChild(link);

                    newsArticlesContainer.appendChild(articleDiv);
                });
            } else {
                newsArticlesContainer.textContent = 'No news articles found.';
            }
        })
        .catch(error => {
            console.error('Error fetching news:', error);
            newsArticlesContainer.textContent = 'Failed to load news.';
        });
});
