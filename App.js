import React, {Component} from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/SignIn/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo' ;
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm' ;
import Rank from './components/Rank/Rank' ;
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import './App.css';

const app = new Clarifai.App({
  apiKey: '255e6894fb274e00b7dc0c9991a77f6f'
 });

const particlesOption = {
  particles: {
    number:{
      value: 100,
      density:{
        enable: true,
        value_area: 800
      
      }
    }
  }
} 

const initialState = {
    input: '',
    imageUrl: '',
    box: {},
    route: 'signin',
    isSignedIn: false,
    user: {
      email:'',
      id:'',
      name:'',
      password:'',
      entries: 0,
      joined: '',
    }
}

class App extends Component{
  constructor() {
    super();
    this.state = initialState;
  }
  loadUser = (data) => {
    this.setState ({user: {
      email: data.email,
      id: data.id,
      name: data.name,
      entries: data.entries,
      joined: data.joined
    }})
}
  

calculateFaceLocation = (data) => {
  const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
  const image = document.getElementById('inputimage');
  const width = Number(image.width);
  const height = Number(image.height);
  return{
    leftCol: clarifaiFace.left_col * width,
    topRow: clarifaiFace.top_row * height,
    rightCol: width - (clarifaiFace.right_col * width),
    bottomRow: height - (clarifaiFace.bottom_row * height),
  }
}

  onSubmit = () => {
    this.setState({imageUrl : this.state.input})
    app.models
    .predict(
      Clarifai.FACE_DETECT_MODEL,
      this.state.input)
    .then(response => {
      if (response) {
        fetch('https://limitless-reaches-06979.herokuapp.com/imageurl', {
          method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: this.state.user.id
            })
        })
        .then(response => response.json())
        .then(count => {
            this.setState(Object.assign(this.state.user, {entries: count}))
        })
        .catch(console.log)
    } 
    this.displayFaceBox(this.calculateFaceLocation(response))
  })
    
  .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if(route ==='signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render() {
  return (
    <div className="App">
      <Particles className='particles '
        params={particlesOption }
      />
  
      <Navigation onRouteChange={this.onRouteChange} />
      { this.state.route === 'home' 
      ? <div>
        <Logo />
        <Rank/>
        <ImageLinkForm 
        onInputChange={this.onInputChange} 
        onSubmit={this.onSubmit}/>
      <FaceRecognition box={this.state.box}imageUrl={this.state.input}/>
    </div>
      : (
        this.state.route === 'signin' ?
        <Signin onRouteChange={this.onRouteChange}/>
        : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
      )
    }
  </div>
  );
 } 
}

export default App;
