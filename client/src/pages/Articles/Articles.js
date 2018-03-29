import React, { Component } from "react";
import { Article } from '../../components/Article'
import Jumbotron from "../../components/Jumbotron";
import API from "../../utils/API";
import { H1, H3, H4 } from '../../components/Headings';
import { Col, Row, Container } from "../../components/Grid";
import { Article } from '../../components/Article';
import { List, ListItem } from "../../components/List";
import { Form, Input, FormBtn, FormGroup, Label } from "../../components/Form";
import { Panel, PanelHeading, PanelBody } from '../../components/Panel';

class Articles extends Component {
  state = {
    articles: [],
    Article: "",
    startyear: "",
    endyear: "",
    page: '0',//page of search results
    previousSearch: {},//previous search term saved after search completed
    noResults: false,//boolean used as flag for conditional rendering
  };

  //function to save an article
  saveArticle = (article) => {
    //creating new article object
    let newArticle = {
      date: article.pub_date,
      title: article.headline.main,
      url: article.web_url,
      summary: article.snippet
    }

    //calling the API
    API
      .saveArticle(newArticle)
      .then(results => {
        //removing the saved article from the results in state
        let unsavedArticles = this.state.results.filter(article => article.headline.main !== newArticle.title)
        this.setState({results: unsavedArticles})
      })
      .catch(err => console.log(err));
  }

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
      this.getHeadlines(query);
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
  getHeadlines = query => 
  {
    //clearing the results array if the user changes search terms
    if (query.topic !== this.state.previousSearch.topic ||
        query.endyear !==this.state.previousSearch.endyear ||
        query.startyear !==this.state.previousSearch.startyear) 
    {
      this.setState({results: []})
    }
    let { topic, startyear, endyear } = query

    let queryUrl = `https://api.nytimes.com/svc/search/v2/articlesearch.json?sort=newest&page=${this.state.page}`
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

  //function that is called when user clicks the get more results button
  getMoreResults = () => {
    let { topic, endyear, startyear} = this.state.previousSearch;
    let query = { topic, endyear, startyear }
    //increments page number for search and then runs query
    let page = this.state.page;
    page++
    this.setState({page: page}, function (){
      this.getHeadlines(query)
    });
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
           
             
                    <h3>Results</h3>
                   <PanelBody>
                    {
                      this.state.results.map((article, i) => (
                          <Article
                            key={i}
                            title={article.headline.main}
                            url={article.web_url}
                            summary={article.snippet}
                            date={article.pub_date}
                            type='Save'
                            onClick={() => this.saveArticle(article)}
                          />
                        )
                      )
                    }
                      <FormBtn type='warning' additional='btn-block' onClick={this.getMoreResults}>Get more results</FormBtn>
                  </PanelBody>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Articles;
