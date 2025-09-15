// db/DummyData.js
const postData = [
    {
        type: "image",
        url: "https://picsum.photos/400/300?random=1",
        content: "Enjoying the sunshine! ☀️",
    },
    {
        type: "video",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: "Check out this cool video!",
    },
    {
        type: "image",
        url: "https://picsum.photos/400/300?random=3",
        content: "Nature walk today 🌿",
        comments: [
            { username: "Alice", text: "Looks amazing!" },
            { username: "Bob", text: "Nice view 😍" },
        ],
    },
    {
        type: "video",
        url: "https://www.w3schools.com/html/movie.mp4",
        content: "My new painting 🎨",
        comments: [
            { username: "Alice", text: "Beautiful work!" },
            { username: "Bob", text: "So talented 👏" },
        ],
    },
    {
        type: "image",
        url: "https://picsum.photos/400/300?random=5",
        content: "Throwback to last summer 🏖️",
    },
    {
        type: "image",
        url: "https://picsum.photos/400/300?random=6",
        content: "Trying out a new recipe 🍝",
    },
    {
        type: "video",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: "Morning run complete 🏃‍♂️",
    },
    {
        type: "image",
        url: "https://picsum.photos/400/300?random=8",
        content: "Weekend vibes with friends 🍹",
    },
    {
        type: "image",
        url: "https://picsum.photos/400/300?random=9",
        content: "City lights ✨",
    },
    {
        type: "video",
        url: "https://www.w3schools.com/html/movie.mp4",
        content: "Relaxing with a good book 📚",
    },
];

export default postData;
