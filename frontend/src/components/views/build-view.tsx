import React from "react";

interface BuildViewProps {
	onTrainClick?: () => void;
}

const BuildView: React.FC<BuildViewProps> = ({ onTrainClick }) => {
	return (
		<div>
			<h2>Build Model</h2>
			<button onClick={onTrainClick}>Proceed to Training</button>
		</div>
	);
};

export { BuildView };
