import React, { Component } from "react";
import { Article } from '../../components/Article'
import Jumbotron from "../../components/Jumbotron";
import API from "../../utils/API";
import { H1, H3, H4 } from '../../components/Headings';
import { Col, Row, Container } from "../../components/Grid";
import { List, ListItem } from "../../components/List";
import { Form, Input, FormBtn, FormGroup, Label } from "../../components/Form";
import { Panel, PanelHeading, PanelBody } from '../../components/Panel';
import Detail from "../SavedArticles";

class Articles extends Component {
  state = {
    articles: [],
    Article: "",
    startyear: "",
    endyear: "",
    page: '0',//page of search results
    previousSearch: {},//previous search term saved after search completed
    noarticles: false,//boolean used as flag for conditional rendering
    savedArticles: {}
  };

  //function to save an article
  saveArticle = (result) => 
  {
    //creating new article object
    let newResult = {
      date: result.pub_date,
      title: result.headline.main,
      url: result.web_url,
      summary: result.snippet
    }
    console.log("saved area: "+result.pub_date + result.headline.main+ result.web_url);
    //calling the API
    API
      .saveArticle(newResult)
      .then(articles => 
      {
        //removing the saved article from the articles in state
        let unsavedArticles = this.state.articles.filter(result => result.headline.main !== newResult.title)
        this.setState({articles: unsavedArticles})
        //when state updated go ahead (referesh)/read the update data
        

      })
      .catch(err => console.log(err));

      this.loadArticles();
      console.log("finished saving");
  }

 componentWillMount() 
  {  this.loadArticles();}

  //function reads requests from previously saved articles (from the db) and returns the info 
  loadArticles = () => {
    API
      .getArticles()
      .then(results => {

        this.setState({savedArticles: results.data})
      })

  };

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  };

  handleFormSubmit = event => {
    event.preventDefault();

      let {topic, startyear, endyear} = this.state;
      let query ={topic, startyear, endyear}
      this.getHeadlines(query);
  };

  //function that queries the NYT API
  getHeadlines = query => 
  {
    //clearing the results array if the user changes search terms
    if (query.topic !== this.state.previousSearch.topic ||
        query.endyear !==this.state.previousSearch.endyear ||
        query.startyear !==this.state.previousSearch.startyear) 
    {
      this.setState({articles: []})
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
      .then(articles => {
        console.log("the articles: " +articles.data.response.docs);
          //concatenating new results to the current state of results.  If empty will just show results,
          //but if search was done to get more, it shows all results.  Also stores current search terms
          //for conditional above, and sets the noarticles flag for conditional rendering of components below
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
      .catch(err=> console.log(err))
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
                      onChange={this.handleInputChange}
                      name='topic'
                      value={this.state.topic}
                      placeholder='Topic of Interest'
                    />
                  </FormGroup>
                  <FormGroup >
                    <Label htmlFor="startyear">Choose a beginning date to search (optional):</Label>
                    <Input
                      onChange={this.handleInputChange}
                      type='date'
                      name='startyear'
                      value={this.state.startyear}
                      placeholder='Starting Year'
                    />
                  </FormGroup>
                  <FormGroup >
                    <Label htmlFor="endyear">Choose an end date to search for (optional):</Label>
                    <Input
                      onChange={this.handleInputChange}
                      type='date'
                      name='endyear'
                      value={this.state.endyear}
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
                      <FormBtn type='warning' additional='btn-block' onClick={this.getMoreResults}>Get more results</FormBtn>
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
