import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import ejs from "ejs";
import axios from "axios";


const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "capstone",
    password: "Alex2@post",
    port: 5432,
  });
  db.connect();

//let books = [];

// Logic for database: 
//     columns in database should be "id", "title", "author", "bio", (possibly "apiresponse" as well to help with load times). 
//     1. in app.get("/"), make a for loop to iterate through all of the database entries using `https://openlibrary.org/search.json?title=${title}&author=${author}`
//         to get the isbn 
//     2. still inside of the for loop use the isbn to get the book cover using `https://covers.openlibrary.org/b/isbn/${isbnNumber}-L.jpg` 
//     3. pass title, author, isbn, and cover to "index.ejs"
//         a. would probably be good to pass "id" as well, putting it into the href call to be utilized later in "books.ejs" for calling the "bio" from the database. 
//     4. for the "book.ejs" render pass in respective title, author, and cover as well as calling "bio" from database as well for respective book(s). 

let book = "The Name of the Wind";
let author = "Patrick Rothfuss";
let isbnNumber = [];

const dataBase = await db.query("SELECT * FROM books ORDER BY id ASC");
const books = dataBase.rows;

// for (let items in books){
//     const info = await axios.get (`https://openlibrary.org/search.json?title=${books.title}`);
//     isbnNumber = push(info.data.docs[0].isbn[2]);
// }

app.get("/", async (req, res) => {
    try {
        const dataBase = await db.query("SELECT * FROM books ORDER BY id ASC");
        const books = dataBase.rows;

        const isbns = books.map((book) => book.isbn);
        res.render("index.ejs", {Title: books.title, Author: books.author, ISBN: isbns, Library: books});
        //console.log()
    } catch (error) {
        console.log(error);
    }
});

app.get("/books", async (req, res) => {
    try{
    const isbnNumber = req.query.isbn;
    const Author = req.query.author;
    const Title = req.query.title;
    const result = await db.query("SELECT bio FROM books WHERE isbn = $1", [isbnNumber]);
    
    const bio = result.rows.map((book) => book.bio);
    const picture = `https://covers.openlibrary.org/b/isbn/${isbnNumber}-L.jpg`;
    res.render("book.ejs", {picture, Author, Title, bio});
    //console.log(bio);
    } catch (error) {
        console.log(error);
    }
    
})

app.post("/addbook", async (req,res) => {
    try{
        const bookTitle = req.body.bookInput;
        const author = req.body.authorInput;
        const info = await axios.get(`https://openlibrary.org/search.json?title=${bookTitle}&author=${author}`);
        const isbn = info.data.docs[0].isbn[0];
        const coverImage = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
        await db.query("INSERT INTO books (title, author, isbn) VALUES ($1, $2, $3)", [bookTitle, author, isbn]);
        res.redirect("/");
    } catch (error) {
        console.log(error);
    }
})
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  