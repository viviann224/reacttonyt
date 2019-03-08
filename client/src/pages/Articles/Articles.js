import React, { Component } from "react";
import { Article } from '../../components/Article'
import Jumbotron from "../../components/Jumbotron";
import API from "../../utils/API";
import { H1, H3, H4 } from '../../components/Headings';
import { Col, Row, Container } from "../../components/Grid";
import { Form, Input, FormBtn, FormGroup, Label } from "../../components/Form";
import { Panel, PanelHeading, PanelBody } from '../../components/Panel';

class Articles extends Component 
{ //variables initalized with state properties
  state = 
  {
    articles: [],
    Article: "",
    startyear: "",
    endyear: "",
    page: "0",            //pages of results
    previousSearch: {},   //keep track of the previous state query 
    noarticles: false,    //boolean variable to determine to display noarticles found
    savedArticles: {}     //keep track of specific saved articles
  };

  //function to save an article from the api call
  saveArticle = (result) => 
  {
    //creating new article object and passing date, title, url, and summary from displayed search
    let newResult = 
    {
      date: result.pub_date,
      title: result.headline.main,
      url: result.web_url,
      summary: result.snippet
    }
    //calling the API to store new saved article
    API
      .saveArticle(newResult)
      .then(articles => 
      {
        //once the article is saved go ahead and filter out all the unsaved articles for user
        let unsavedArticles = this.state.articles.filter(result => result.headline.main !== newResult.title)
        this.setState({articles: unsavedArticles})
      })
      .catch(err => console.log(err));
      //then go ahead and reload and display all the articles
      this.loadArticles();
  }

//once everything loads go ahead and display (on the first user scession)
 componentWillMount() 
  {  this.loadArticles();}

  //loadArticles is a function which reads requests from previously saved articles (from the db) and returns the info 
  loadArticles = () => 
  {
    API
      .getArticles()
      .then(results => 
      {   this.setState({savedArticles: results.data}) })
  };

  handleInputChange = event => 
  {
    //when there is a change to the field, the input for title, endyear, or startyear is updated
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  };

  handleFormSubmit = event => 
  {
    event.preventDefault();
    //once user clicks submit go ahead and update the topic, startyear, and endyear to the current value user put in
    let {topic, startyear, endyear} = this.state;
    //go ahead and pass in the current values into query
    let query ={topic, startyear, endyear}
    //call get headlines and narrow down the nyt search results with the query 
    this.getHeadlines(query);
  };

  //function that requests the NYT API
  getHeadlines = (query) => 
  {
    //if the user changed the topic, endyear, or the start year go ahead and read out new articles
    if (query.topic !== this.state.previousSearch.topic ||
        query.endyear !==this.state.previousSearch.endyear ||
        query.startyear !==this.state.previousSearch.startyear) 
    { //go ahead and empty out the last search
      this.setState({articles: []})
    } //update the new each fields 
    let { topic, startyear, endyear } = query

    let queryUrl = `https://api.nytimes.com/svc/search/v2/articlesearch.json?sort=newest&page=${this.state.page}`
    //let key = `&api-key=ac37023831a046ad9447acf3101b4c79`
    let key = `&api-key=TG0BIFFzSF9qw8BqZjaNMRKOHxXaYjBO`
    

    //removes the special spaces in the search query url
    if(topic.indexOf(' ')>=0){
      topic = topic.replace(/\s/g, '+');
    }
    //based on the query go ahead and append each parameter to the queryUrl
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

    //once queryUrl build go ahead and pass an api request to nyt
    API
      .queryNYT(queryUrl)
      .then(articles => {
          //once query request finish store the current scession to previous search, 
          //and clear out the rest of fields for next
          this.setState({
            articles: [...this.state.articles, ...articles.data.response.docs],
            previousSearch: query,
            topic: '',
            startyear: '',
            endyear: '',
            title:'',
            data:'',
            url:''
          }, function (){
            this.state.articles.length === 0 ? this.setState({noarticles: true}) : this.setState({noarticles: false})
          });
      })
  }
  render() {
    return (
      <Container fluid>
        <Row>
          <Col size="md-12">
            <Jumbotron>
              <H1 className='page-header text-center'>REACT to NEW YORK TIMES</H1>
              <H4 className='text-center'>Reacting to all the best articles one save at a time</H4>
            </Jumbotron>
            <Panel>
              <PanelHeading>
                <H3>Search</H3>
              </PanelHeading>
              <PanelBody>
                <Form style={{marginBottom: '30px'}}>
                  <FormGroup>
                    <Label htmlFor="topic">Search a topic:</Label>
                    <Input
                      name='topic'
                      value={this.state.name}
                      onChange={this.handleInputChange}
                      placeholder='Topic of Interest'
                    />
                  </FormGroup>
                  <FormGroup >
                    <Label htmlFor="startyear">Choose a beginning date to search (optional):</Label>
                    <Input
                      name='startyear'
                      value={this.state.startyear}
                      onChange={this.handleInputChange}
                      type='date'
                      placeholder='Starting Year'
                    />
                  </FormGroup>
                  <FormGroup >
                    <Label htmlFor="endyear">Choose an end date to search for (optional):</Label>
                    <Input
                      name='endyear'
                      value={this.state.endyear}
                      onChange={this.handleInputChange}
                      type='date'
                      placeholder='Ending Year'
                    />
                  </FormGroup>
                  <FormBtn
                    disabled={!(this.state.topic)}
                    onClick={this.handleFormSubmit}
                    type='info'
                    >Submit
                  </FormBtn>
                </Form>
              </PanelBody>
            </Panel>
            { this.state.noarticles ?
              (<H1>No results Found.  Please try again</H1>) :
              this.state.articles.length>0 ? (
                <Panel>
                  <PanelHeading>
                    <H3>Results</H3>
                  </PanelHeading>
                  <PanelBody>
                    {
                      this.state.articles.map((article, i) => (
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
                  </PanelBody>
                </Panel>
              ) : ''
            }
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Articles;
