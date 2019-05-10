import React from 'react';
import ReactDOM from 'react-dom';

class Row extends React.Component {
    constructor(props) {
        super(props);
    }

    boxClick = (e) => {
        if(typeof this.props.onBoxClick === 'function' && !this.props.over) {
            const cls = e.target.className;
            let element;
            if(cls === 'player1' || cls === 'player2' || cls === 'd1' || cls === 'd2'){
                element = e.target.parentElement;
            } else if(cls === 'd') {
                element = e.target.parentElement.parentElement;
            } else {
                element = e.target;
            }
            this.props.onBoxClick(element);
        }
    };

    render() {

        const areas = [0,1,2,3,4,5,6,7].map((number) => {
            if(this.props.started) {
                return (
                    <div onClick={this.boxClick} className={(this.props.id + number) % 2 === 0 ? 'box' : 'gameBox'}
                         id={[this.props.id, number]} key={number}>
                        {this.props.board[this.props.id][number] === 'player1' && <div className='player1'/>}
                        {this.props.board[this.props.id][number] === 'player2' && <div className='player2'/>}
                        {this.props.board[this.props.id][number] === 'd1' &&
                        <div className='d1'><span className='d'>D</span></div>}
                        {this.props.board[this.props.id][number] === 'd2' &&
                        <div className='d2'><span className='d'>D</span></div>}
                    </div>
                );
            } else {
                return <div className={(this.props.id + number) % 2 === 0 ? 'box' : 'gameBox'} key={number}/>
            }
        });

        return <div className='row'>{areas}</div>;
    }
}

class Board extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            board: this.props.board,
            pawnClicked: false,
            possibleMoves: [],
            activePlayer: ['player1', 'player2'].reduce((prev,curr,ind,arr) => {
                return arr[Math.random() < 0.5 ? 0 : 1];
            }),
            pawnPosition: [],
            duringBeating: false,
            scoreOfPlayer1: 0,
            scoreOfPlayer2: 0,
            messageLeft: '',
            messageRight: '',
            isGameStarted: false,
            leftTime: {
                minutes: this.getMinFromSec(this.props.settings.time),
                seconds: this.props.settings.time - this.getMinFromSec(this.props.settings.time)*60,
            },
            rightTime: {
                minutes: this.getMinFromSec(this.props.settings.time),
                seconds: this.props.settings.time - this.getMinFromSec(this.props.settings.time)*60,
            },
            playerClickedSomething: false,
            gameWithComputer: this.props.settings.gameWithComputer,
            computer: this.props.settings.computer,
        };
        this.isBeatingPossible = false;
        this.changedMessage = false;
        this.messageLeft = '';
        this.messageRight = '';
        this.specialMessage = false;
        this.isGameOver = false;
    }

    getMinFromSec = (seconds) => (seconds - (seconds % 60)) / 60;

    possibleMovesCheck = (position, actualBoard) => {

        const x = position[0], y = position[1];
        let moves = [], oponent = (actualBoard[x][y] === 'player1' || actualBoard[x][y] === 'd1') ? 'player2' : 'player1';
        const beats = this.nextBeat(x,y,actualBoard,oponent);

        if(beats) {
            return beats;
        }


        const onBoard = (i,j) => (i<8 && i>=0 && j<8 && j>=0);

        if(actualBoard[x][y] === 'd1' || actualBoard[x][y] === 'd2') {

            let nextRow, nextColumn;

            for (let k = 0; k < 4; k++) {
                switch(k) {
                    case 0:
                        nextRow = -1;
                        nextColumn = -1;
                        break;
                    case 1:
                        nextRow = -1;
                        nextColumn = 1;
                        break;
                    case 2:
                        nextRow = 1;
                        nextColumn = -1;
                        break;
                    default:
                        nextRow = 1;
                        nextColumn = 1;
                }

                let i = x + nextRow, j = y + nextColumn;

                while(onBoard(i,j) && actualBoard[i][j] === 'empty') {

                    moves.push(String(i) + String(j));
                    i += nextRow;
                    j += nextColumn;

                }
            }

        } else {

            if (actualBoard[x][y] === 'player1') {

                if (onBoard(x + 1, y - 1) && actualBoard[x + 1][y - 1] === 'empty') {
                    moves.push(String(x + 1) + String(y - 1));
                }
                if (onBoard(x + 1, y + 1) && actualBoard[x + 1][y + 1] === 'empty') {
                    moves.push(String(x + 1) + String(y + 1));
                }
            } else {

                if (onBoard(x - 1, y - 1) && actualBoard[x - 1][y - 1] === 'empty') {
                    moves.push(String(x - 1) + String(y - 1));
                }
                if (onBoard(x - 1, y + 1) && actualBoard[x - 1][y + 1] === 'empty') {
                    moves.push(String(x - 1) + String(y + 1));
                }
            }
        }

        return moves;

    };

    nextBeat = (x,y,actualBoard,oponent) => {

        let board = [];

        for(let s = 0; s < 8; s++) {
            board.push([...actualBoard[s]]);
        }

        let tab = [];
        const onBoard = (i,j) => (i<8 && i>=0 && j<8 && j>=0);

        if(board[x][y] === 'd1' || board[x][y] === 'd2') {

            let nextRow, nextColumn;

            for (let k = 0; k < 4; k++) {
                switch(k) {
                    case 0:
                        nextRow = -1;
                        nextColumn = -1;
                        break;
                    case 1:
                        nextRow = -1;
                        nextColumn = 1;
                        break;
                    case 2:
                        nextRow = 1;
                        nextColumn = -1;
                        break;
                    default:
                        nextRow = 1;
                        nextColumn = 1;
                }
                let i = x + nextRow, j = y + nextColumn;
                while(onBoard(i,j)) {

                    if(board[i][j] === this.state.activePlayer || board[i][j] === (this.state.activePlayer === 'player1' ? 'd1' : 'd2')) {
                        break;
                    }
                    if(board[i][j] === oponent || board[i][j] === (oponent === 'player1' ? 'd1' : 'd2')) {

                        let t = i + nextRow, s = j + nextColumn;

                        if(onBoard(t,s) && board[t][s] !== 'empty') {
                            break;
                        }

                        while(onBoard(t,s) && board[t][s] === 'empty') {
                            tab.push(String(t) + String(s));
                            t += nextRow;
                            s += nextColumn;
                        }

                        break;
                    }

                    i += nextRow;
                    j += nextColumn;

                }
            }

        } else {

            if (onBoard(x - 2, y - 2) && onBoard(x - 1, y - 1) && board[x - 2][y - 2] === 'empty' && (board[x - 1][y - 1] === oponent || board[x - 1][y - 1] === (oponent === 'player1' ? 'd1' : 'd2'))) {
                tab.push(String(x - 2) + String(y - 2));
            }
            if (onBoard(x - 2, y + 2) && onBoard(x - 1, y + 1) && board[x - 2][y + 2] === 'empty' && (board[x - 1][y + 1] === oponent || board[x - 1][y + 1] === (oponent === 'player1' ? 'd1' : 'd2'))) {
                tab.push(String(x - 2) + String(y + 2));
            }
            if (onBoard(x + 2, y - 2) && onBoard(x + 1, y - 1) && board[x + 2][y - 2] === 'empty' && (board[x + 1][y - 1] === oponent || board[x + 1][y - 1] === (oponent === 'player1' ? 'd1' : 'd2'))) {
                tab.push(String(x + 2) + String(y - 2));
            }
            if (onBoard(x + 2, y + 2) && onBoard(x + 1, y + 1) && board[x + 2][y + 2] === 'empty' && (board[x + 1][y + 1] === oponent || board[x + 1][y + 1] === (oponent === 'player1' ? 'd1' : 'd2'))) {
                tab.push(String(x + 2) + String(y + 2));
            }

        }

        if(tab.length === 0) {
            return false
        } else {
            return tab;
        }
    };

    movePawn = (start, end) => {

        end = [Number(end[0]), Number(end[1])];

        document.getElementById(String(start[0] + ',' + String(start[1]))).classList.remove('active');

        let tab = [];

        for(let s = 0; s < 8; s++) {
            tab.push([...this.state.board[s]]);
        }

        tab[end[0]][end[1]] = tab[start[0]][start[1]];
        tab[start[0]][start[1]] = 'empty';

        if(Math.abs(start[0] - end[0]) >= 2) {

            const nextRow = (end[0] - start[0]) / Math.abs(end[0] - start[0]);
            const nextColumn = (end[1] - start[1]) / Math.abs(end[1] - start[1]);

            for(let i = 1; i < Math.abs(end[0] - start[0]); i++) {
                if(tab[start[0] + i*nextRow][start[1] + i*nextColumn] !== 'empty') {

                    tab[start[0] + i*nextRow][start[1] + i*nextColumn] = 'empty';

                    if(this.state.activePlayer === 'player1') {
                        this.setState({
                            scoreOfPlayer1: this.state.scoreOfPlayer1 + 1,
                        });
                    } else {
                        this.setState({
                            scoreOfPlayer2: this.state.scoreOfPlayer2 + 1,
                        });
                    }

                    const beats = this.nextBeat(end[0],end[1],tab,this.state.activePlayer === 'player1' ? 'player2' : 'player1');
                    if(beats){

                        document.getElementById(String(end[0] + ',' + String(end[1]))).classList.add('active');

                        if(this.state.gameWithComputer && (this.state.activePlayer === this.state.computer)) {

                            this.renderMessage('', '');
                            this.setState({
                                board: tab,
                                possibleMoves: beats,
                                pawnPosition: [end[0],end[1]],
                                duringBeating: true,
                            }, () => {

                                setTimeout(() => {

                                    this.movePawn(this.state.pawnPosition, beats[Math.floor(Math.random()*beats.length)].split(''));

                                }, 1000);


                            });


                        } else {

                            this.setState({
                                board: tab,
                                possibleMoves: beats,
                                pawnPosition: [end[0],end[1]],
                                duringBeating: true,
                            });
                            this.renderMessage('', '');

                        }
                        return;
                    }
                    break;
                }
            }
        }

        if(end[0] === 0 && this.state.activePlayer === 'player2' || end[0] === 7 && this.state.activePlayer === 'player1') {

            tab[end[0]][end[1]] = this.state.activePlayer === 'player1' ? 'd1' : 'd2';

        }

        this.renderMessage('', '');

        this.setState({
            board: tab,
            activePlayer: this.state.activePlayer === 'player1' ? 'player2' : 'player1',
            pawnClicked: false,
            duringBeating: false,
            messageLeft: '',
            messageRight: '',
            playerClickedSomething: false,
        }, () => {
            if(this.state.gameWithComputer && (this.state.activePlayer === this.state.computer)) {
                setTimeout(() => {
                    this.computerTurn();
                }, 1000);
            }
        });

    };

    computerTurn = () => {
        if(this.state.gameWithComputer && (this.state.activePlayer === this.state.computer)) {

            let allBeats = [];

            for(let i = 0; i < 8; i++) {
                for(let j = 0; j < 8; j++) {
                    if(this.state.board[i][j] === this.state.computer || this.state.board[i][j] === (this.state.computer === 'player1' ? 'd1' : 'd2')) {
                        let beats = this.nextBeat(i,j,this.state.board,this.state.computer === 'player1' ? 'player2' : 'player1');
                        if(beats) {
                            for(let k = 0; k < beats.length; k++) {
                                allBeats.push([ [i,j], beats[k].split('') ]);
                            }
                        }
                    }
                }
            }

            let allPossibleMoves = [];

            for(let i = 0; i < 8; i++) {
                for(let j = 0; j < 8; j++) {
                    if(this.state.board[i][j] === this.state.computer || this.state.board[i][j] === (this.state.computer === 'player1' ? 'd1' : 'd2')) {
                        let possibleMoves = this.possibleMovesCheck([i,j], this.state.board);
                        if(possibleMoves.length > 0) {
                            for(let k = 0; k < possibleMoves.length; k++) {
                                allPossibleMoves.push([ [i,j], possibleMoves[k].split('') ]);
                            }
                        }
                    }
                }
            }

            const onBoard = (i,j) => (i<8 && i>=0 && j<8 && j>=0);

            const willBeBeaten = (start, pos) => {

                let virtualBoard = [];

                for(let s = 0; s < 8; s++) {
                    virtualBoard.push([...this.state.board[s]]);
                }

                pos = [Number( pos[0] ), Number( pos[1] )];

                virtualBoard[pos[0]][pos[1]] = virtualBoard[start[0]][start[1]];
                virtualBoard[start[0]][start[1]] = 'empty';
                for(let i = 1; i < Math.abs(start[0] - pos[0]); i++) {
                    virtualBoard[start[0] + i*(pos[0] - start[0])/Math.abs(start[0] - pos[0])][start[1] + i*(pos[1] - start[1])/Math.abs(pos[1] - start[1])] = 'empty';
                }

                let nextRow, nextColumn, i, j;

                for (let k = 0; k < 4; k++) {
                    switch (k) {
                        case 0:
                            nextRow = -1;
                            nextColumn = -1;
                            break;
                        case 1:
                            nextRow = -1;
                            nextColumn = 1;
                            break;
                        case 2:
                            nextRow = 1;
                            nextColumn = -1;
                            break;
                        default:
                            nextRow = 1;
                            nextColumn = 1;
                    }

                    i = pos[0] + nextRow;
                    j = pos[1] + nextColumn;
                    const oponent = this.state.activePlayer === 'player1' ? 'player2' : 'player1';

                    while (onBoard(i, j)) {

                        if (virtualBoard[i][j] === this.state.activePlayer || virtualBoard[i][j] === (this.state.activePlayer === 'player1' ? 'd1' : 'd2')) {
                            break;
                        }

                        if (virtualBoard[i][j] === oponent) {
                            if (Math.abs(pos[0] - i) === 1 && onBoard(pos[0] - nextRow,pos[1] - nextColumn) && virtualBoard[pos[0] - nextRow][pos[1] - nextColumn] === 'empty') {
                                return true;
                            } else {
                                break;
                            }
                        } else if (virtualBoard[i][j] === (oponent === 'player1' ? 'd1' : 'd2')) {
                            if (onBoard(pos[0] - nextRow,pos[1] - nextColumn) && virtualBoard[pos[0] - nextRow][pos[1] - nextColumn] === 'empty') {
                                return true;
                            } else {
                                break;
                            }
                        }

                        i += nextRow;
                        j += nextColumn;

                    }
                }

                return false;
            };

            if (allBeats.length > 0) {

                let bestBeats = [];

                for (let i = 0; i < allBeats.length; i++) {
                    if (!willBeBeaten(allBeats[i][0],allBeats[i][1])) {
                        bestBeats.push(allBeats[i]);
                    }
                }

                bestBeats = bestBeats.length > 0 ? [...bestBeats] : [...allBeats];

                let randomBeat = Math.floor(Math.random() * bestBeats.length);
                this.movePawn(bestBeats[randomBeat][0], bestBeats[randomBeat][1]);

            } else if(allPossibleMoves.length > 0) {

                let bestMoves = [];

                for(let i = 0; i < allPossibleMoves.length; i++) {
                    if(!willBeBeaten(allPossibleMoves[i][0],allPossibleMoves[i][1])) {
                        bestMoves.push(allPossibleMoves[i]);
                    }
                }

                bestMoves = bestMoves.length > 0 ? [...bestMoves] : [...allPossibleMoves];

                bestMoves.sort((a,b) => {

                    const distanceFromCenterA1 = Math.abs(Number(a[1][0]) - 3.5);
                    const distanceFromCenterA2 = Math.abs(Number(a[1][1]) - 3.5);
                    const distanceFromCenterB1 = Math.abs(Number(b[1][0]) - 3.5);
                    const distanceFromCenterB2 = Math.abs(Number(b[1][1]) - 3.5);
                    const maxDistanceFromCenterA = Math.max(distanceFromCenterA1,distanceFromCenterA2);
                    const maxDistanceFromCenterB = Math.max(distanceFromCenterB1,distanceFromCenterB2);

                    if(maxDistanceFromCenterA < maxDistanceFromCenterB) {
                        return -1;
                    }
                    if(maxDistanceFromCenterA > maxDistanceFromCenterB) {
                        return 1;
                    }
                    if(maxDistanceFromCenterA === maxDistanceFromCenterB) {
                        if(distanceFromCenterA1 + distanceFromCenterA2 < distanceFromCenterB1 + distanceFromCenterB2) {
                            return -1;
                        }
                        if(distanceFromCenterA1 + distanceFromCenterA2 > distanceFromCenterB1 + distanceFromCenterB2) {
                            return 1;
                        }
                        if(distanceFromCenterA1 + distanceFromCenterA2 === distanceFromCenterB1 + distanceFromCenterB2) {
                            return Math.random() - 0.5;
                        }
                    }
                });

                this.movePawn(bestMoves[0][0], bestMoves[0][1]);
            }
        }
    };

    renderMessage = (message1, message2) => {
        if(this.state.activePlayer === 'player1') {
            this.setState({
                messageLeft: message1,
                messageRight: message2,
            });
        } else {
            this.setState({
                messageLeft: message2,
                messageRight: message1,
            });
        }
    };

    handleBoxClick = (e) => {

        if(this.state.gameWithComputer && (this.state.activePlayer === this.state.computer)) {
            return;
        }

        this.setState({
            playerClickedSomething: true,
        });

        let pos = e.id.split(',');
        pos = [Number(pos[0]), Number(pos[1])];

        if(this.state.pawnClicked) {

            if(this.state.possibleMoves.indexOf(String(pos[0]) + String(pos[1])) !== -1) {

                this.movePawn(this.state.pawnPosition, [pos[0], pos[1]]);

            } else if(this.state.board[pos[0]][pos[1]] === this.state.activePlayer) {

                if(this.state.duringBeating) {
                    this.renderMessage('Dokończ bicie.', '');
                    return;
                }

                if(this.isBeatingPossible) {
                    if(!this.nextBeat(pos[0],pos[1],this.state.board,this.state.activePlayer === 'player1' ? 'player2' : 'player1')) {
                        this.renderMessage('Masz bicie. Nie możesz ruszyć się tym pionkiem.', '');
                        return;
                    } else {this.renderMessage('','')}
                }

                document.getElementById(String(this.state.pawnPosition[0] + ',' + String(this.state.pawnPosition[1]))).classList.remove('active');
                document.getElementById(String(pos[0] + ',' + String(pos[1]))).classList.add('active');

                this.setState({
                    pawnPosition: [pos[0], pos[1]],
                    possibleMoves: this.possibleMovesCheck([pos[0], pos[1]],this.state.board),
                });

            } else if(this.state.board[pos[0]][pos[1]] === (this.state.activePlayer === 'player1' ? 'd1' : 'd2')) {

                if(this.state.duringBeating) {
                    this.renderMessage('Dokończ bicie.', '');
                    return;
                }

                if(this.isBeatingPossible) {
                    if(!this.nextBeat(pos[0],pos[1],this.state.board,this.state.activePlayer === 'player1' ? 'player2' : 'player1')) {
                        this.renderMessage('Masz bicie. Nie możesz ruszyć się tą damką.', '');
                        return;
                    } else {this.renderMessage('','')}
                }

                document.getElementById(String(this.state.pawnPosition[0] + ',' + String(this.state.pawnPosition[1]))).classList.remove('active');
                document.getElementById(String(pos[0] + ',' + String(pos[1]))).classList.add('active');

                this.setState({
                    pawnPosition: [pos[0], pos[1]],
                    possibleMoves: this.possibleMovesCheck([pos[0], pos[1]],this.state.board),
                });

            } else {

                if(this.state.duringBeating) {
                    this.renderMessage('Dokończ bicie.', '');
                    return;
                }

                if(this.isBeatingPossible) {
                    this.renderMessage('Niedozwolony ruch. Musisz wykonać bicie.', '');
                    return;
                } else {
                    this.renderMessage('Niedozwolony ruch.', '');
                }

                document.getElementById(String(this.state.pawnPosition[0] + ',' + String(this.state.pawnPosition[1]))).classList.remove('active');

                this.setState({
                    pawnClicked: false,
                });
            }

        } else if(this.state.board[pos[0]][pos[1]] === this.state.activePlayer) {

            if(this.isBeatingPossible) {
                if(!this.nextBeat(pos[0],pos[1],this.state.board,this.state.activePlayer === 'player1' ? 'player2' : 'player1')) {
                    this.renderMessage('Masz bicie. Nie możesz ruszyć się tym pionkiem.', '');

                    this.specialMessage = true;

                    return;
                } else {this.renderMessage('','')}
            }

            e.classList.add('active');

            this.setState({
                pawnClicked: true,
                possibleMoves: this.possibleMovesCheck([pos[0], pos[1]],this.state.board),
                pawnPosition: [pos[0], pos[1]],
            });

        } else if(this.state.board[pos[0]][pos[1]] === (this.state.activePlayer === 'player1' ? 'd1' : 'd2')) {

            if(this.isBeatingPossible) {
                if(!this.nextBeat(pos[0],pos[1],this.state.board,this.state.activePlayer === 'player1' ? 'player2' : 'player1')) {
                    this.renderMessage('Masz bicie. Nie możesz ruszyć się tą damką.', '');

                    this.specialMessage = true;

                    return;
                } else {this.renderMessage('','')}
            }

            e.classList.add('active');

            this.setState({
                pawnClicked: true,
                possibleMoves: this.possibleMovesCheck([pos[0], pos[1]],this.state.board),
                pawnPosition: [pos[0], pos[1]],
            });
        } else {
            this.renderMessage('','');
        }
    };

    render() {

        this.changedMessage = false;
        let anyPossibleMove = false;
        this.isBeatingPossible = false;

        for(let i = 0; i < 8; i++) {
            for(let j = 0; j < 8; j++) {
                if(this.state.board[i][j] === this.state.activePlayer) {
                    if(this.nextBeat(i,j, this.state.board,this.state.activePlayer === 'player1' ? 'player2' : 'player1')) {
                        this.isBeatingPossible = true;
                        break;
                    }
                }
                if(this.state.board[i][j] === (this.state.activePlayer === 'player1' ? 'd1' : 'd2')) {
                    if(this.nextBeat(i,j, this.state.board,this.state.activePlayer === 'player1' ? 'player2' : 'player1')) {
                        this.isBeatingPossible = true;
                        break;
                    }
                }
            }
            if(this.isBeatingPossible) {
                break;
            }
        }

        for(let i = 0; i < 8; i++) {
            for(let j = 0; j < 8; j++) {
                if(this.state.board[i][j] === this.state.activePlayer || this.state.board[i][j] === (this.state.activePlayer === 'player1' ? 'd1' : 'd2')) {
                    if(this.possibleMovesCheck([i,j], this.state.board).length > 0) {
                        anyPossibleMove = true;
                        break;
                    }
                }
            }
            if(anyPossibleMove) {
                break;
            }
        }

        if(this.state.scoreOfPlayer1 === 12) {

            this.messageLeft = 'Gratulacje! Odnosisz zwycięstwo. Wszystkie pionki przeciwnika zostały zbite.';
            this.messageRight = 'Niestety odnosisz porażkę. Nie masz już pionków na planszy.';
            this.changedMessage = true;
            this.isGameOver = true;

        } else if(this.state.scoreOfPlayer2 === 12) {

            this.messageLeft = 'Niestety odnosisz porażkę. Nie masz już pionków na planszy.';
            this.messageRight = 'Gratulacje! Odnosisz zwycięstwo. Wszystkie pionki przeciwnika zostały zbite.';
            this.changedMessage = true;
            this.isGameOver = true;

        } else if(!anyPossibleMove) {

            if(this.state.activePlayer === 'player1') {

                this.messageLeft = 'Niestety odnosisz porażkę. Nie masz możliwości ruchu.';
                this.messageRight = 'Gratulacje! Odnosisz zwycięstwo. Twój przeciwnik nie ma możliwości ruchu.';
                this.changedMessage = true;
            } else {

                this.messageLeft = 'Gratulacje! Odnosisz zwycięstwo. Twój przeciwnik nie ma możliwości ruchu.';
                this.messageRight = 'Niestety odnosisz porażkę. Nie masz możliwości ruchu.';
                this.changedMessage = true;
            }

            this.isGameOver = true;

        } else if(this.isBeatingPossible && !this.state.duringBeating && !this.state.playerClickedSomething && !this.specialMessage) {

            if(this.state.activePlayer === 'player1') {

                this.messageLeft = 'Masz bicie. Pamiętaj, że bicie jest obowiązkowe.';
                this.messageRight = '';
                this.changedMessage = true;
            } else {

                this.messageLeft = '';
                this.messageRight = 'Masz bicie. Pamiętaj, że bicie jest obowiązkowe.';
                this.changedMessage = true;
            }
        }

        this.specialMessage = false;

        const rows = [0,1,2,3,4,5,6,7].map((number) => {
            return <Row over={this.isGameOver} started={this.state.isGameStarted} onBoxClick={this.handleBoxClick} board={this.state.board} id={number} key={number}/>;
        });

        let name1, name2, isLeft = false, isRight = false;

        if(this.state.gameWithComputer && this.state.computer === 'player1') {
            name1 = 'Komputer';
            name2 = this.props.settings.nick1;
            isLeft = true;
        } else if(this.state.gameWithComputer && this.state.computer === 'player2') {
            name1 = this.props.settings.nick1;
            name2 = 'Komputer';
            isRight = true;
        } else {
            name1 = this.props.settings.nick1;
            name2 = this.props.settings.nick2;
        }

        return (
            <div>
                <Score scoreLeft={this.state.scoreOfPlayer1} scoreRight={this.state.scoreOfPlayer2} nick1={name1} nick2={name2}/>

                <LeftPanel message={this.changedMessage ? this.messageLeft : this.state.messageLeft} activePlayer={this.state.activePlayer} leftTime={this.state.leftTime} started={this.state.isGameStarted} isLeftComputer={isLeft}/>

                <div className='board'>{rows}</div>

                <RightPanel message={this.changedMessage ? this.messageRight : this.state.messageRight} activePlayer={this.state.activePlayer} rightTime={this.state.rightTime} started={this.state.isGameStarted} isRightComputer={isRight}/>

                <BottomPanel onEnd={this.endGame} onStart={this.startGame} onGoToSettings={this.goToSettings} started={this.state.isGameStarted} settingsChanged={this.props.settingsChanged} settingsNotChanged={this.props.settingsNotChanged}/>
            </div>
        );
    }

    goToSettings = () => {
        if(typeof this.props.onGoToSettings === 'function') {
            this.props.onGoToSettings();
        }
    };

    startGame = () => {
        this.setState({
            isGameStarted: true,
            board: makeBoard(),
            pawnClicked: false,
            possibleMoves: [],
            activePlayer: ['player1', 'player2'].reduce((prev,curr,ind,arr) => {
                return arr[Math.random() < 0.5 ? 0 : 1];
            }),
            pawnPosition: [],
            duringBeating: false,
            scoreOfPlayer1: 0,
            scoreOfPlayer2: 0,
            messageLeft: '',
            messageRight: '',
            leftTime: {
                minutes: this.getMinFromSec(this.props.settings.time),
                seconds: this.props.settings.time - this.getMinFromSec(this.props.settings.time)*60,
            },
            rightTime: {
                minutes: this.getMinFromSec(this.props.settings.time),
                seconds: this.props.settings.time - this.getMinFromSec(this.props.settings.time)*60,
            },
            gameWithComputer: this.props.settings.gameWithComputer,
            computer: this.props.settings.computer,
        }, () => {
            if(this.state.gameWithComputer && (this.state.activePlayer === this.state.computer)) {
                setTimeout(() => {
                    this.computerTurn();
                },1000);
            }
        });
        this.isBeatingPossible = false;
        this.changedMessage = false;
        this.messageLeft = '';
        this.messageRight = '';
        this.specialMessage = false;
        this.isGameOver = false;

        this.intervalId = setInterval(() => {
            if(this.isGameOver) {

                clearInterval(this.intervalId);

            } else if(this.state.activePlayer === 'player1') {
                if (this.state.leftTime.minutes === 0 && this.state.leftTime.seconds === 0) {

                    this.isGameOver = true;
                    this.renderMessage('Niestety odnosisz porażkę. Skończył Ci się czas.', 'Gratulacje! Odnosisz zwycięstwo. Twojemu przeciwnikowi skończył się czas.');

                    clearInterval(this.intervalId);
                } else {
                    if (this.state.leftTime.seconds === 0) {
                        let newTime = {minutes: this.state.leftTime.minutes - 1, seconds: 59};
                        this.setState({
                            leftTime: newTime,
                        });
                    } else {
                        let newTime = {minutes: this.state.leftTime.minutes, seconds: this.state.leftTime.seconds - 1};
                        this.setState({
                            leftTime: newTime,
                        });
                    }
                }
            } else {
                if (this.state.rightTime.minutes === 0 && this.state.rightTime.seconds === 0) {

                    this.isGameOver = true;
                    this.renderMessage('Niestety odnosisz porażkę. Skończył Ci się czas.', 'Gratulacje! Odnosisz zwycięstwo. Twojemu przeciwnikowi skończył się czas.');
                    clearInterval(this.intervalId);
                } else {
                    if (this.state.rightTime.seconds === 0) {
                        let newTime = {minutes: this.state.rightTime.minutes - 1, seconds: 59};
                        this.setState({
                            rightTime: newTime,
                        });
                    } else {
                        let newTime = {minutes: this.state.rightTime.minutes, seconds: this.state.rightTime.seconds - 1};
                        this.setState({
                            rightTime: newTime,
                        });
                    }
                }
            }
        },1000);
// console.log('start', this.state.gameWithComputer && (this.state.activePlayer === this.state.computer));
//         if(this.state.gameWithComputer && (this.state.activePlayer === this.state.computer)) {
//             setTimeout(() => {
//                 this.computerTurn();
//             },1000);
//         }
    };

    endGame = () => {
        clearInterval(this.intervalId);
        this.setState({
            isGameStarted: false,
            leftTime: {
                minutes: this.getMinFromSec(this.props.settings.time),
                seconds: this.props.settings.time - this.getMinFromSec(this.props.settings.time)*60,
            },
            rightTime: {
                minutes: this.getMinFromSec(this.props.settings.time),
                seconds: this.props.settings.time - this.getMinFromSec(this.props.settings.time)*60,
            },
            messageLeft: '',
            messageRight: '',
            scoreOfPlayer1: 0,
            scoreOfPlayer2: 0,
        });
    };
}

class BottomPanel extends React.Component {
    constructor(props) {
        super(props);
    }

    firstStart = () => {
        if(typeof this.props.settingsNotChanged === 'function') {
            this.props.settingsNotChanged();
        }
        this.start();
    };

    start = () => {
        if(typeof this.props.onStart === 'function') {
            this.props.onStart();
        }
    };

    end = () => {
        if(typeof this.props.onEnd === 'function') {
            this.props.onEnd();
        }
    };

    goToSettings = () => {
        if(typeof this.props.onGoToSettings === 'function') {
            this.props.onGoToSettings();
        }
    };

    render() {
        let middleButton;
        if(this.props.started) {
            middleButton = <button onClick={this.end}>Zakończ Grę</button>;
        } else {
            middleButton = this.props.settingsChanged && <button onClick={this.firstStart}>Rozpocznij Grę</button>;
        }
        return (
            <div className='bottomPanel'>
                {!this.props.started && !this.props.settingsChanged && <button onClick={this.start}>Graj od nowa</button>}
                {middleButton}
                {!this.props.started && !this.props.settingsChanged && <button onClick={this.goToSettings}>Ustawienia</button>}
            </div>
        );
    }
}

class Score extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <div className='nickLeft'><span>{this.props.nick1 === '' ? 'Gracz1' : this.props.nick1}</span></div>
                <h1 className='score'>WYNIK</h1>
                <h1 className='score'>{this.props.scoreLeft} : {this.props.scoreRight}</h1>
                <div className='nickRight'><span>{this.props.nick2 === '' ? 'Gracz2' : this.props.nick2}</span></div>
            </div>
        );
    }
}

class LeftPanel extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let minutes = this.props.leftTime.minutes;
        let seconds = this.props.leftTime.seconds < 10 ? '0' + this.props.leftTime.seconds : this.props.leftTime.seconds;

        return (
            <div className='leftPanel'>
                {this.props.started && !this.props.isLeftComputer &&
                <div className='panelContainer'>
                    <p>{this.props.activePlayer === 'player1' ? 'Teraz Twój ruch.' : 'Czekaj. Teraz ruch przeciwnika.'}</p>
                </div>
                }
                <div className='panelContainer'><span>Czas: {minutes} : {seconds}</span></div>
                {this.props.started && !this.props.isLeftComputer &&
                <div className='panelContainer'><p>{this.props.message}</p></div>
                }
            </div>
        );
    }
}

class RightPanel extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let minutes = this.props.rightTime.minutes;
        let seconds = this.props.rightTime.seconds < 10 ? '0' + this.props.rightTime.seconds : this.props.rightTime.seconds;
        return (
            <div className='rightPanel'>
                {this.props.started && !this.props.isRightComputer &&
                <div className='panelContainer'>
                    <p>{this.props.activePlayer === 'player2' ? 'Teraz Twój ruch.' : 'Czekaj. Teraz ruch przeciwnika.'}</p>
                </div>
                }
                <div className='panelContainer'><span>Czas: {minutes} : {seconds}</span></div>
                {this.props.started && !this.props.isRightComputer &&
                <div className='panelContainer'><p>{this.props.message}</p></div>
                }
            </div>
        );
    }
}

function makeBoard() {

    const tab = [];

    for(let i = 0; i < 8; i++) {

        let row = [];

        for(let j = 0; j < 8; j++) {
            if((i+j)%2 === 0) {
                if(i < 3) {
                    row[j] = 'player1';
                } else
                if(i > 4) {
                    row[j] = 'player2';
                } else {
                    row[j] = 'empty';
                }
            } else {
                row[j] = 'empty';
            }
        }
        tab.push(row);
    }
    return tab;
}

const initialBoard = makeBoard();

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            settings: {nick1: '', nick2: '', time: '', gameWithComputer: false, computer: ''},
        };
    }

    changeInput = (e) => {
        if(e.target.id === 'nick1') {
            this.setState({
                settings: {nick1: e.target.value, nick2: this.state.settings.nick2, time: this.state.settings.time, gameWithComputer: this.state.settings.gameWithComputer, computer: this.state.settings.computer}
            });
        } else if(e.target.id === 'nick2') {
            this.setState({
                settings: {nick1: this.state.settings.nick1, nick2: e.target.value, time: this.state.settings.time, gameWithComputer: this.state.settings.gameWithComputer, computer: this.state.settings.computer}
            });
        } else if(e.target.id === 'time') {
            this.setState({
                settings: {nick1: this.state.settings.nick1, nick2: this.state.settings.nick2, time: e.target.value, gameWithComputer: this.state.settings.gameWithComputer, computer: this.state.settings.computer}
            });
        } else if(e.target.name === 'twoPlayers') {
            this.setState({
                settings: {
                    nick1: this.state.settings.nick1,
                    nick2: this.state.settings.nick2,
                    time: this.state.settings.time,
                    gameWithComputer: false,
                    computer: this.state.settings.computer
                }
            });
        } else if(e.target.name === 'computer') {
            this.setState({
                settings: {
                    nick1: this.state.settings.nick1,
                    nick2: this.state.settings.nick2,
                    time: this.state.settings.time,
                    gameWithComputer: true,
                    computer: Math.random() < 0.5 ? 'player1' : 'player2'
                }
            });
        }
    };

    goToGame = (settings) => {
        if(typeof this.props.onGoToGame === 'function') {
            if(Number(settings.time) < 30 || Number(settings.time) > 300) {
                settings.time = 180;
            }
            this.props.onGoToGame(settings);
        }
    };

    render() {
        return (
            <div className='settingsWindow'>
                <div className='header'>
                    <div className='pawnWhite'></div>
                    <h1 className='title'>WARCABY</h1>
                    <div className='pawnBlue'></div>
                </div>
                <div className='playerSettings'>
                    <div className='radio'>
                        <label>Dwóch graczy<input type='radio' name='twoPlayers' checked={this.state.settings.gameWithComputer === false} value='twoPlayers' onChange={this.changeInput}/></label>
                        <label>Gra z komputerem<input type='radio' name='computer' checked={this.state.settings.gameWithComputer === true} value='computer' onChange={this.changeInput}/></label>
                    </div>
                    <div className='nicks'>
                        <div className='nick'>
                            <label htmlFor="nick1">Gracz 1: </label>
                            <input id='nick1' type='text' value={this.state.settings.nick1} onChange={this.changeInput} placeholder='Podaj nick' maxLength='15'/>
                        </div>
                        {!this.state.settings.gameWithComputer &&
                        <div className='nick'>
                            <label htmlFor="nick2">Gracz 2: </label>
                            <input id='nick2' type='text' value={this.state.settings.nick2} onChange={this.changeInput}
                                   placeholder='Podaj nick' maxLength='15'/>
                        </div>
                        }
                    </div>
                </div>
                <div className='timeDiv'>
                    <label htmlFor='time'>Czas rozgrywki: </label>
                    <input id='time' type='number' min='30' max='300' value={this.state.settings.time} onChange={this.changeInput} placeholder='min.30 max.300'/>sek
                </div>
                <div className='goToGameBtnContainer'>
                    <button onClick={(e) => this.goToGame(this.state.settings)}>Przejdź do gry</button>
                </div>
            </div>
        );
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gameOrSettings: 'settings',
            settings: {nick1: 'Player1', nick2: 'Player2', time: 120, gameWithComputer: false},
            settingsChanged: true,
        };
    }

    goToSettings = () => {
        this.setState({
            gameOrSettings: 'settings',
        });
    };

    goToGame = (newSettings) => {
        this.setState({
            gameOrSettings: 'game',
            settings: newSettings,
            settingsChanged: true,
        });
    };

    settingsNotChanged = () => {
        this.setState({
            settingsChanged: false,
        });
    };

    render() {
        if(this.state.gameOrSettings === 'settings') {
            return <Settings onGoToGame={this.goToGame}/>;
        } else {
            return <Board onGoToSettings={this.goToSettings} board={initialBoard} settings={this.state.settings} settingsChanged={this.state.settingsChanged} settingsNotChanged={this.settingsNotChanged}/>;
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    ReactDOM.render(
        <App/>,
        document.getElementById('app')
    );
});