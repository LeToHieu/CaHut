import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Menubar } from 'primereact/menubar';
import { Menu } from 'primereact/menu';
import { toast, ToastContainer } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import logo from '../res/logo.png';
import '../css/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [exams, setExams] = useState([]);
  const [visible, setVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [examName, setExamName] = useState('');
  const [editExamId, setEditExamId] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [roomVisible, setRoomVisible] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [username, setUsername] = useState('');
  const [userImage, setUserImage] = useState(1);
  const menuRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
    const decoded = jwtDecode(token);
    setUsername(decoded.username);
    setUserImage(decoded.userImage || 1);
    fetchExams(token);
    if (location.state?.showToast) {
      const { toastMessage, toastType } = location.state;
      if (toastType === 'info') {
        toast.info(toastMessage, { position: 'top-right', autoClose: 2000 });
      } else if (toastType === 'error') {
        toast.error(toastMessage, { position: 'top-right', autoClose: 3000 });
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [navigate, location.state]);

  const fetchExams = async (token) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/exam/get`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setExams(data);
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error('Lỗi khi lấy danh sách Quiz:', err);
    }
  };

  const handleSaveExam = async () => {
    const token = localStorage.getItem('token');
    const url = isEdit
      ? `${process.env.REACT_APP_API_URL}/exam/edit/${editExamId}`
      : `${process.env.REACT_APP_API_URL}/exam/create`;
    const method = isEdit ? 'PUT' : 'POST';
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ examName }),
      });
      const data = await response.json();
      setVisible(false);
      setExamName('');
      if (response.ok) {
        fetchExams(token);
        toast.success("Lưu Quiz thành công!!!", { position: 'top-right', autoClose: 3000 });
      } else {
        toast.error(`Xẩy ra lỗi ${data.message}`, { position: 'top-right', autoClose: 3000 });
      }
    } catch (err) {
      console.error('Lỗi khi lưu Quiz:', err);
      toast.error(`Lỗi khi lưu Quiz: ${err}`, { position: 'top-right', autoClose: 3000 });
    }
  };

  const handleDeleteExam = async (examId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/exam/delete/${examId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        fetchExams(token);
        toast.success("Xóa Quiz thành công!!!", { position: 'top-right', autoClose: 3000 });
      } else {
        toast.error(data.message, { position: 'top-right', autoClose: 3000 });
      }
    } catch (err) {
      console.error('Lỗi khi xóa Quiz:', err);
    }
  };

  const actionTemplate = (rowData) => {
    return (
      <div className="action-buttons">
        <Button
          label="Sửa tên"
          className="btn-edit"
          onClick={() => openEditExamModal(rowData)}
        />
        <Button
          label="Thêm câu hỏi"
          className="btn-add"
          onClick={() => navigate(`/edit-exam/${rowData.examName}/${rowData._id}`)}
        />
        <Button
          label="Xóa"
          className="btn-delete"
          onClick={() => handleDeleteExam(rowData._id)}
        />
      </div>
    );
  };

  const handleCreateRoom = async () => {
    if (!selectedExam) {
      toast.warn("Vui lòng chọn một Quiz", { position: 'top-right', autoClose: 3000 });
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/room/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ examId: selectedExam._id }),
      });
      const data = await response.json();
      if (response.ok) {
        setRoomVisible(false);
        navigate(`/room/${data.roomId}`);
      } else {
        toast.error(`Lỗi: ${data.message}`, { position: 'top-right', autoClose: 3000 });
      }
    } catch (err) {
      toast.error(`Lỗi khi tạo phòng: ${err}`, { position: 'top-right', autoClose: 3000 });
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode) {
      toast.warn("Vui lòng nhập mã phòng!", { position: 'top-right', autoClose: 3000 });
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/room/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ roomId: roomCode }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate(`/room/${data.roomId}`);
      } else {
        toast.error(`Lỗi: ${data.message}`, { position: 'top-right', autoClose: 3000 });
      }
    } catch (err) {
      toast.error(`Lỗi khi tạo phòng: ${err}`, { position: 'top-right', autoClose: 3000 });
    }
  };

  const openAddExamModal = () => {
    setVisible(true);
    setIsEdit(false);
    setExamName('');
  };

  const openEditExamModal = (rowData) => {
    setVisible(true);
    setIsEdit(true);
    setEditExamId(rowData._id);
    setExamName(rowData.examName);
  };

  const menuItems = [
    {
      label: 'Chỉnh sửa Profile',
      icon: 'pi pi-user-edit',
      command: () => navigate('/edit-profile'),
    },
    {
      label: 'Đăng Xuất',
      icon: 'pi pi-sign-out',
      command: () => {
        localStorage.removeItem('token');
        navigate('/login');
      },
    },
  ];

  const end = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <img
        src={require(`../res/${userImage}.png`)} 
        alt="User"
        style={{ width: '40px', height: '40px', cursor: 'pointer', borderRadius: '50%' }}
        onClick={(e) => menuRef.current.toggle(e)}
      />
      <Menu model={menuItems} popup ref={menuRef} id="popup_menu" />
    </div>
  );

  const start = <img alt="logo" src={logo} height="40" className="mr-2" />;

  return (
    <>
      <Menubar
        start={start}
        end={end}
        style={{ backgroundColor: '#fffdf4', position: 'fixed', width: '100%', zIndex: '1000', top: '0', left: '0' }}
      />
      <div style={{ padding: '20px', marginTop: '3rem' }}>
        <h2 style={{ textAlign: 'center' }}>Chào mừng {username} quay trở lại trang chủ!</h2>
        <div className="quiz-container">
          <div className="quiz-card-join-room">
            <div style={{ fontWeight: 'bold' }}>
              Tham gia game? <br />
              Xin mời nhập mã phòng
            </div>
            <div>
              <InputText
                style={{
                  fontWeight: 'bold',
                  borderRadius: '17px',
                  borderColor: 'black',
                  borderWidth: '3px',
                  textAlign: 'center',
                  height: '3rem',
                }}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Nhập mã phòng (6 số)"
              />
              <Button
                style={{
                  marginLeft: '0.5rem',
                  color: 'black',
                  backgroundColor: '#ffc679',
                  fontWeight: 'bold',
                  borderRadius: '17px',
                  borderColor: 'black',
                  borderWidth: '3px',
                  textAlign: 'center',
                  height: '3rem',
                }}
                label="Tham gia"
                onClick={handleJoinRoom}
              />
            </div>
          </div>
        </div>
        <div className="quiz-container">
          <div className="quiz-card">
            <div className="quiz-card-content">
              <div>
                <span style={{ fontSize: '1.4rem' }}>Chưa có phòng chơi ?</span>
                <br />
                Tạo phòng và mời mọi người thôi nào!
              </div>
              <Button
                className="quiz-button"
                label="Tạo phòng"
                icon="pi pi-users"
                onClick={() => setRoomVisible(true)}
              />
            </div>
          </div>
          <div className="quiz-card">
            <div className="quiz-card-content">
              <div>
                <span style={{ fontSize: '1.4rem' }}>Tạo ngay bộ đề độc đáo</span>
                <br />
                khiến cho bạn bè rối não
              </div>
              <Button
                className="quiz-button"
                label="Tạo Quiz"
                icon="pi pi-plus"
                onClick={() => openAddExamModal()}
              />
            </div>
          </div>
        </div>
        <hr style={{ marginTop: '1rem', width: '70%' }} />
        <div className="custom-table-container">
          <DataTable value={exams} tableStyle={{ width: '100%' }}>
            <Column field="examName" header="Tên Quiz" alignHeader="center" />
            <Column header="Hành động" body={actionTemplate} alignHeader="center" />
          </DataTable>
        </div>
        <Dialog
          header={isEdit ? 'Sửa Tên Quiz' : 'Tạo Quiz'}
          visible={visible}
          style={{ width: '50vw' }}
          onHide={() => setVisible(false)}
        >
          <div>
            <InputText
              className="dialog-input-text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="Nhập tên Quiz"
              style={{ width: '100%', marginBottom: '10px' }}
            />
            <div style={{ textAlign: 'right' }}>
              <Button label={isEdit ? 'Sửa Quiz' : 'Tạo Quiz'} onClick={handleSaveExam} />
            </div>
          </div>
        </Dialog>
        <Dialog header="Tạo Phòng" visible={roomVisible} style={{ width: '50vw' }} onHide={() => setRoomVisible(false)}>
          <div>
            <Dropdown
              className="dialog-input-text"
              value={selectedExam}
              options={exams}
              onChange={(e) => setSelectedExam(e.value)}
              optionLabel="examName"
              placeholder="Chọn quiz"
              style={{ width: '100%', marginBottom: '10px' }}
            />
            <div style={{ textAlign: 'right' }}>
              <Button label="Tạo phòng" onClick={handleCreateRoom} />
            </div>
          </div>
        </Dialog>
      </div>
      <ToastContainer />
    </>
  );
};

export default Home;