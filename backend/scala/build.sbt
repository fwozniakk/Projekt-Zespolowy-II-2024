import Dependencies._

ThisBuild / scalaVersion     := "3.5.2"
ThisBuild / version          := "0.1.0-SNAPSHOT"
ThisBuild / organization     := "dk.mble"
ThisBuild / organizationName := "Maciej Błędkowski i Filip Woźniak"

lazy val root = (project in file("."))
  .settings(
    name := "scala",
    resolvers += lilaMaven,
    libraryDependencies ++= Seq(
  munit % Test,
  chess
 )
  )

// See https://www.scala-sbt.org/1.x/docs/Using-Sonatype.html for instructions on how to publish to Sonatype.
