import React from "react";

interface TrainViewProps {
	onTestClick?: () => void;
}

const TrainView: React.FC<TrainViewProps> = ({ onTestClick }) => {
	return (
		<div>
			<h2>Train Model</h2>
			<button onClick={onTestClick}>Proceed to Testing</button>
		</div>
	);
};

export { TrainView };
