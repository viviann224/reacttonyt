import React, { Component } from "react";
import DeleteBtn from "../../components/DeleteBtn";
import Jumbotron from "../../components/Jumbotron";
import API from "../../utils/API";
import { Link } from "react-router-dom";
import { Col, Row, Container } from "../../components/Grid";
import { List, ListItem } from "../../components/List";
import { Input, TextArea, FormBtn } from "../../components/Form";

class Articles extends Component {
  state = {
    articles: [],
    topic: "",
    startyear: "",
    endyear: "",
    page: '0',//page of search results
    previousSearch: {},//previous search term saved after search completed
  };

  // componentDidMount() {
  //   this.loadArticles();
  // }

  // loadArticles = () => {
  //   API.getArticles()
  //     .then(res =>
  //       this.setState({ articles: res.data, topic: "", startyear: "", endyear: "" })
  //     )
  //     .catch(err => console.log(err));
  // };

  // deleteArticle = id => {
  //   API.deleteArticle(id)
  //     .then(res => this.loadArticles())
  //     .catch(err => console.log(err));
  // };

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  };

  handleFormSubmit = event => {
    event.preventDefault();
    //if (this.state.topic && this.state.startyear) 
    //{
      let {topic, startyear, endyear} = this.state;
      let query ={topic, startyear, endyear}
      this.getArticles(query);
    //   API.saveArticle({
    //     topic: this.state.topic,
    //     startyear: this.state.startyear,
    //     endyear: this.state.endyear
    //   })
    //     .then(res => this.loadArticles())
    //     .catch(err => console.log(err));
    //}
  };

  //function that queries the NYT API
  getArticles = query => 
  {
    //clearing the results array if the user changes search terms
    if (query.topic !== this.state.previousSearch.topic ||
        query.endyear !==this.state.previousSearch.endyear ||
        query.startyear !==this.state.previousSearch.startyear) 
    {
      this.setState({results: []})
    }
    let { topic, startyear, endyear } = query

    let queryUrl = `https://api.nytimes.com/svc/search/v2/articlesearch.json?sort=newest&page=0`
    let key = `&api-key=ac37023831a046ad9447acf3101b4c79`

    //removing spaces and building the query url conditionally
    //based on presence of optional search terms
    if(topic.indexOf(' ')>=0){
      topic = topic.replace(/\s/g, '+');
    }
    if (topic){
      queryUrl+= `&fq=${topic}`
    }
    if(startyear){
      queryUrl+= `&begin_date=${startyear}`
    }
    if(endyear){
      queryUrl+= `&end_date=${endyear}`
    }
    queryUrl+=key;

    //calling the API
    API
      .queryNYT(queryUrl)
      .then(results => {
          //concatenating new results to the current state of results.  If empty will just show results,
          //but if search was done to get more, it shows all results.  Also stores current search terms
          //for conditional above, and sets the noResults flag for conditional rendering of components below
          this.setState({
            results: [...this.state.results, ...results.data.response.docs],
            previousSearch: query,
            topic: '',
            startyear: '',
            endyear: ''
          }, function (){
            this.state.results.length === 0 ? this.setState({noResults: true}) : this.setState({noResults: false})
          });
      })
      .catch(err=> console.log(err))
  }



  render() {
    return (
      <Container fluid>
        <Row>
          <Col size="md-6">
            <Jumbotron>
              <h1>What Articles Should I Read?</h1>
            </Jumbotron>
            <form>
              <Input
                value={this.state.topic}
                onChange={this.handleInputChange}
                value={this.state.topic}
                name="topic"
                placeholder="topic (required)"
              />
              <Input
                value={this.state.startyear}
                onChange={this.handleInputChange}
                name="startyear"
                value={this.state.startyear}
                placeholder="startyear (required)"
              />
              <TextArea
                value={this.state.endyear}
                onChange={this.handleInputChange}
                value={this.state.endyear}
                name="endyear"
                placeholder="endyear (Optional)"
              />
              <FormBtn
                disabled={!(this.state.startyear && this.state.topic)}
                onClick={this.handleFormSubmit}
              >
                Submit Article
              </FormBtn>
            </form>
          </Col>
          <Col size="md-6 sm-12">
            <Jumbotron>
              <h1>Articles On My List</h1>
            </Jumbotron>
            {this.state.articles.length ? (
              <List>
                {this.state.articles.map(article => (
                  <ListItem key={article._id}>
                    <Link to={"/articles/" + article._id}>
                      <strong>
                        {article.topic} by {article.startyear}
                      </strong>
                    </Link>
                    <DeleteBtn onClick={() => this.deleteArticle(article._id)} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <h3>No Results to Display</h3>
            )}
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Articles;
