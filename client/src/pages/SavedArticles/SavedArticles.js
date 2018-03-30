import React, { Component } from "react";
import { Article } from '../../components/Article'
import { Col, Row, Container } from "../../components/Grid";
import Jumbotron from "../../components/Jumbotron";
import { H1, H3, H4 } from '../../components/Headings';
import API from "../../utils/API";
import { Panel, PanelHeading, PanelBody } from '../../components/Panel'

class Detail extends Component {
  state = {
    savedArticles: {}
  };
  // will read all the data then display
  componentWillMount() 
  {  this.loadArticles();}

  //function reads requests from previously saved articles (from the db) and returns the info 
  loadArticles = () => {
    API
      .getArticles()
      .then(results => {
        this.setState({savedArticles: results.data});

      })
  };

  //function that sends the request from the client side to delete an article from the db (sever side) 
  deleteArticle = id => {
    API
      .deleteArticle(id)
      .then(results => {
        //once deleted, they are removed from the state and articles are rendered
        let savedArticles = this.state.savedArticles.filter(article => article._id !== id)
        this.setState({savedArticles: savedArticles})
        //when state updated go ahead (referesh)/read the update data
        this.loadArticles();
      })
      .catch(err => console.log(err));
  };

  render() 
  {
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
                <H3>Saved Articles</H3>
              </PanelHeading>
              <PanelBody>
                { this.state.savedArticles.length > 0 ?
                  (this.state.savedArticles.map((article, i) => (
                    <Article
                      key={i}
                      title={article.title}
                      url={article.url}
                      summary={article.summary}
                      date={article.date}
                      type='Delete'
                      onClick={() => this.deleteArticle(article._id)}
                    />
                    )
                  )) : <H1>You have no saved articles.</H1>
                }
              </PanelBody>
            </Panel>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Detail;
