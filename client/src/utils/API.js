import axios from "axios";

export default {
  //adding api call for recipe
  getRecipes: function(query) 
  {
    console.log(query);
    //console.log(axios.get("/api/recipes", { params: { q: query } }))
    return axios.get("/api/recipes", { params: { q: query } });
  },
  // Gets all books
  getBooks: function() {
    return axios.get("/api/books");
  },
  // Gets the book with the given id
  getBook: function(id) {
    return axios.get("/api/books/" + id);
  },
  // Deletes the book with the given id
  deleteBook: function(id) {
    return axios.delete("/api/books/" + id);
  },
  // Saves a book to the database
  saveBook: function(bookData) {
    return axios.post("/api/books", bookData);
  }
};
