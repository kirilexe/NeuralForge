
import React, { useState } from "react";
import Navbar from "../components/header/Navbar";
import { BuildView } from "../components/views/build-view";
import { TrainView } from "../components/views/train-view";
import { TestView } from "../components/views/test-view";

const Dashboard: React.FC = () => {
	const [activeTab, setActiveTab] = useState<'build' | 'train' | 'test'>('build');

		return (
				<div style={{ minHeight: '100vh', background: '#18181b', color: '#fff', padding: 0 }}>
					<Navbar />
					<div style={{ height: 80 }} />
					<nav style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
					<button
						style={{ margin: '0 8px', padding: '8px 24px', borderRadius: 8, background: activeTab === 'build' ? '#312e81' : '#27272a', color: '#fff', border: 'none', fontWeight: 600 }}
						onClick={() => setActiveTab('build')}
					>
						Build
					</button>
					<button
						style={{ margin: '0 8px', padding: '8px 24px', borderRadius: 8, background: activeTab === 'train' ? '#312e81' : '#27272a', color: '#fff', border: 'none', fontWeight: 600 }}
						onClick={() => setActiveTab('train')}
					>
						Train
					</button>
					<button
						style={{ margin: '0 8px', padding: '8px 24px', borderRadius: 8, background: activeTab === 'test' ? '#312e81' : '#27272a', color: '#fff', border: 'none', fontWeight: 600 }}
						onClick={() => setActiveTab('test')}
					>
						Test
					</button>
				</nav>
				<main>
					{activeTab === 'build' && <BuildView onTrainClick={() => setActiveTab('train')} />}
					{activeTab === 'train' && <TrainView onTestClick={() => setActiveTab('test')} />}
					{activeTab === 'test' && <TestView />}
				</main>
			</div>
		);
};

export default Dashboard;
