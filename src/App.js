import React, { Component } from "react";
import Navigation from "./components/Navigation/Navigation";
import Logo from "./components/Logo/Logo";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Rank from "./components/Rank/Rank";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import ParticlesBg from "particles-bg";
import Signin from "./components/Signin/Signin";
import Register from "./components/Register/Register";
import "./App.css";

const returnClarifaiRequestOptions = (imageUrl) => {
	const PAT = "15646a891cd34cdba5e25f5b9b6f3863";
	const USER_ID = "oq5j7ugcxd3r";
	const APP_ID = "test";
	// const MODEL_ID = "face-detection";
	// const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';
	const IMAGE_URL = imageUrl;

	const raw = JSON.stringify({
		user_app_id: {
			user_id: USER_ID,
			app_id: APP_ID,
		},
		inputs: [
			{
				data: {
					image: {
						url: IMAGE_URL,
					},
				},
			},
		],
	});

	const requestOptions = {
		method: "POST",
		headers: {
			Accept: "application/json",
			Authorization: "Key " + PAT,
		},
		body: raw,
	};

	return requestOptions;
};

const initialState = {
	input: "",
	imageUrl: "",
	box: {},
	route: "signin",
	isSignedIn: false,
	user: {
		id: "",
		name: "",
		email: "",
		entries: 0,
		joined: "",
	},
};

class App extends Component {
	constructor() {
		super();
		this.state = initialState;
	}

	loadUser = (data) => {
		this.setState({
			user: {
				id: data.id,
				name: data.name,
				email: data.email,
				entries: data.entries,
				joined: data.joined,
			},
		});
	};
	onInputChange = (event) => {
		this.setState({ input: event.target.value });
	};
	onRouteChange = (route) => {
		if (route === "signout") {
			this.setState(initialState);
		} else if (route === "home") {
			this.setState({ isSignedIn: true });
		}
		this.setState({ route: route });
	};

	calculateFaceLocation = (data) => {
		const clarifaiFace =
			data.outputs[0].data.regions[0].region_info.bounding_box;

		const image = document.getElementById("inputimage");
		const width = Number(image.width);
		const height = Number(image.height);
		return {
			leftCol: clarifaiFace.left_col * width,
			topRow: clarifaiFace.top_row * height,
			rightCol: width - clarifaiFace.right_col * width,
			bottomRow: height - clarifaiFace.bottom_row * height,
		};
	};

	displayFaceBox = (box) => {
		this.setState({ box: box });
	};

	onButtonSubmit = (event) => {
		this.setState({ imageUrl: this.state.input });

		fetch(
			"https://api.clarifai.com/v2/models/" + "face-detection" + "/outputs",
			returnClarifaiRequestOptions(this.state.input)
		)
			.then((response) => response.json())
			.then((response) => {
				if (response) {
					fetch("https://smart-brain-backend-2zux.onrender.com/image", {
						method: "put",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							id: this.state.user.id,
						}),
					})
						.then((response) => response.json())
						.then((count) => {
							this.setState(Object.assign(this.state.user, { entries: count }));
						})
						.catch(console.log);
				}
				this.displayFaceBox(this.calculateFaceLocation(response));
			})
			.catch((err) => console.log(err));
	};

	render() {
		const { isSignedIn, imageUrl, route, box } = this.state;
		return (
			<div className="App">
				<div className="parti_bg_all">
					<ParticlesBg num={15} type="circle" bg={true} />
				</div>
				<div className="flex justify-between">
					<Logo />
					<Navigation
						isSignedIn={isSignedIn}
						onRouteChange={this.onRouteChange}
					/>
				</div>
				{route === "home" ? (
					<div>
						{/* <Logo /> */}
						<Rank
							name={this.state.user.name}
							entries={this.state.user.entries}
						/>
						<ImageLinkForm
							onInputChange={this.onInputChange}
							onButtonSubmit={this.onButtonSubmit}
						/>
						<FaceRecognition box={box} imageUrl={imageUrl} />
					</div>
				) : route === "signin" ? (
					<Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
				) : (
					<Register
						loadUser={this.loadUser}
						onRouteChange={this.onRouteChange}
					/>
				)}
			</div>
		);
	}
}

export default App;
