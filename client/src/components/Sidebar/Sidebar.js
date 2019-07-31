import React from "react";
import { useSelector } from "react-redux";
import SubjectSelect from "./SubjectSelect/SubjectSelect";
import Subjects from "../SubjectItem/Subjects";
import Notifications from "../Notifications/Notifications";
import Optimisations from "../Optimisations/Optimisations";
import OptimiseButton from "../Optimisations/OptimiseButton/OptimiseButton";
import SubjectInfo from "./SubjectInfo/SubjectInfo";

export default function Sidebar() {
  const viewSubject = useSelector(state => state.viewSubject);
  return (
    <>
      <Notifications />
      {/* <RegistrationCountdown /> */}
      <SubjectSelect />
      {viewSubject.viewing ? (
        <SubjectInfo subject={viewSubject.subject} />
      ) : (
        <Subjects />
      )}
      <Optimisations />
      <OptimiseButton />
    </>
  );
}
