import React from "react";
const Rank = ({ name, entries }) => {
	return (
		<div className="mt5">
			<div className="white f3 fw">
				{`${name}, your current entry count is...`}
			</div>
			<div className="white f1 bld">{entries}</div>
		</div>
	);
};

export default Rank;
