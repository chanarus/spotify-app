import React, { Component } from "react";
import { Consumer } from "../../context";
import axios from "axios";
import request from "request";
import "./Search.css";

class Search extends Component {
	state = {
		searchText: "",
		resultCount: 20,
		selectedValue: "track"
	};

	/**
	 * Change the state with text inputs
	 */
	handleChange = event => {
		this.setState({
			[event.target.name]: event.target.value
		});
	};

	/**
	 * Change the state with radio inputs
	 */
	handleSelectedChange = event => {
		this.setState({ selectedValue: event.target.value });
	};

	/**
	 * Search using the api
	 * After responce dispath it to change the globle state
	 */
	search = (dispatch, event) => {
		event.preventDefault();
		const { selectedValue, searchText, resultCount } = this.state;

		//Set the auth options
		const authOptions = {
			url:
				"https://cors-anywhere.herokuapp.com/https://accounts.spotify.com/api/token",
			headers: {
				Authorization:
					"Basic " +
					new Buffer(
						process.env.REACT_APP_SPOTIFY_CLIENT_ID +
							":" +
							process.env.REACT_APP_SPOTIFY_CLIENT_SECRET
					).toString("base64")
			},
			form: {
				grant_type: "client_credentials"
			},
			json: true
		};
		//Send the post request to the api to get a access token
		request.post(authOptions, (error, response, body) => {
			if (!error && response.statusCode === 200) {
				// use the access token to access the Spotify Web API
				const token = body.access_token;
				//using the access token get the data from the api
				axios
					.get(
						`https://api.spotify.com/v1/search?q=${searchText}&type=${selectedValue}&market=US&limit=${resultCount}&offset=0`,
						{
							headers: {
								Authorization: `Bearer ${token}`
							}
						}
					)
					.then(res => {
						const { searchText, selectedValue } = this.state;
						let payload = [];
						if (selectedValue === "track")
							payload = res.data.tracks.items;
						if (selectedValue === "artist")
							payload = res.data.artists.items;
						if (selectedValue === "album")
							payload = res.data.albums.items;
						if (selectedValue === "playlist")
							payload = res.data.playlists.items;
						dispatch({
							type: "SEARCH",
							payload,
							heading: `Search Result for ${selectedValue}: ${searchText}`,
							searchType: selectedValue,
							noResult: payload.length ? false : true
						});

						//Clear the search text input
						this.setState({
							searchText: ""
						});
					})
					.catch(err => console.log(err));
			}
		});
	};

	render() {
		return (
			<Consumer>
				{value => {
					const { dispatch } = value;
					return (
						<div className="card card-body mb-4 p-4">
							<h1 className="display-4 text-center">
								<i className="fab fa-spotify" />
								&nbsp; Search
							</h1>
							<form onSubmit={this.search.bind(this, dispatch)}>
								<div className="form-group">
									<input
										required
										type="text"
										className="form-control from-control-lg mb-4"
										placeholder="Search..."
										name="searchText"
										value={this.state.searchText}
										onChange={this.handleChange}
									/>
									<div className="form-row">
										<div className="col-md-9 col-sm-12 d-flex flex-wrap">
											<div className="custom-control custom-radio">
												<input
													className="custom-control-input"
													id="track"
													value="track"
													type="radio"
													name="searchType"
													checked={
														this.state
															.selectedValue ===
														"track"
													}
													onChange={
														this
															.handleSelectedChange
													}
												/>
												<label
													className="custom-control-label"
													htmlFor="track"
												>
													Track
												</label>
											</div>
											<div className="custom-control custom-radio">
												<input
													className="custom-control-input"
													id="album"
													value="album"
													type="radio"
													name="searchType"
													checked={
														this.state
															.selectedValue ===
														"album"
													}
													onChange={
														this
															.handleSelectedChange
													}
												/>
												<label
													className="custom-control-label"
													htmlFor="album"
												>
													Album
												</label>
											</div>
											<div className="custom-control custom-radio">
												<input
													className="custom-control-input"
													id="artist"
													value="artist"
													type="radio"
													name="searchType"
													checked={
														this.state
															.selectedValue ===
														"artist"
													}
													onChange={
														this
															.handleSelectedChange
													}
												/>
												<label
													className="custom-control-label"
													htmlFor="artist"
												>
													Artist
												</label>
											</div>
											<div className="custom-control custom-radio">
												<input
													className="custom-control-input"
													id="playlist"
													value="playlist"
													type="radio"
													name="searchType"
													checked={
														this.state
															.selectedValue ===
														"playlist"
													}
													onChange={
														this
															.handleSelectedChange
													}
												/>
												<label
													className="custom-control-label"
													htmlFor="playlist"
												>
													Playlist
												</label>
											</div>
										</div>
										<div className="col-md-3 col-sm-12">
											<div className="input-group">
												<div className="input-group-prepend">
													<span className="input-group-text">
														Results
													</span>
												</div>
												<select
													className="custom-select"
													value={
														this.state.resultCount
													}
													onChange={this.handleChange}
													name="resultCount"
												>
													<option value="5">5</option>
													<option value="10">
														10
													</option>
													<option value="20">
														20
													</option>
													<option value="50">
														50
													</option>
													<option value="100">
														100
													</option>
												</select>
											</div>
										</div>
									</div>
								</div>

								<button
									className="btn btn-success btn-lg btn-block mb-5"
									type="submit"
								>
									Search
								</button>
							</form>
						</div>
					);
				}}
			</Consumer>
		);
	}
}

export default Search;
